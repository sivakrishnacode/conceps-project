import { Injectable, OnModuleInit, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import * as crypto from 'crypto';
import * as fs from 'fs';
import { XMLParser, XMLBuilder } from 'fast-xml-parser';
import { SignedXml } from 'xml-crypto';
import { v4 as uuidv4 } from 'uuid';

export interface UidaiKycData {
  name: string;
  dob: string;
  gender: string;
  address: string;
  txnRef: string;
}

export interface EncryptedPid {
  encData: Buffer;
  encSessionKey: Buffer;
  iv: Buffer;
  authTag: Buffer;
  certExpiry: string;
}

@Injectable()
export class UidaiService implements OnModuleInit {
  private uidaiCert: Buffer;
  private auaPrivateKey: Buffer;
  private parser: XMLParser;
  private builder: XMLBuilder;

  private readonly UIDAI_ERRORS: Record<string, string> = {
    '100': 'Invalid Aadhaar number',
    '200': 'Invalid authentication factor',
    '300': 'Denylisted Aadhaar number',
    '400': 'OTP expired or invalid',
    '500': 'Aadhaar not registered for OTP',
    '540': 'OTP limit exceeded for today',
    '550': 'Invalid OTP',
    '800': 'AUA not authorised',
    '900': 'Invalid license key',
    'K-700': 'eKYC not allowed for this user',
    'K-540': 'eKYC limit exceeded',
  };

  constructor() {
    this.parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '' });
    this.builder = new XMLBuilder({ ignoreAttributes: false, attributeNamePrefix: '' });
  }

  async onModuleInit() {
    const certPath = process.env.UIDAI_PUBLIC_CERT_PATH;
    const keyPath = process.env.UIDAI_PRIVATE_KEY_PATH;

    if (!certPath || !keyPath) {
       // Only throw if not in mock mode or if we specifically want prod
       if (process.env.USE_MOCK_KYC !== 'true') {
         throw new InternalServerErrorException('UIDAI certificates not configured');
       }
       return;
    }

    try {
      this.uidaiCert = fs.readFileSync(certPath);
      this.auaPrivateKey = fs.readFileSync(keyPath);
    } catch (err) {
      if (process.env.USE_MOCK_KYC !== 'true') {
        throw new InternalServerErrorException(`Failed to load UIDAI certificates: ${err.message}`);
      }
    }
  }

  async generateOtp(aadhaarNumber: string): Promise<{ txnId: string }> {
    const txnId = `TXN:${uuidv4()}`;
    const xml = this.buildOtpRequestXml(aadhaarNumber, txnId);

    try {
      const response = await fetch(`${process.env.UIDAI_BASE_URL}/otp/${process.env.UIDAI_AUA_CODE}/${aadhaarNumber}/${process.env.UIDAI_ASA_LICENSE_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/xml' },
        body: xml,
        signal: AbortSignal.timeout(10000)
      });

      const resXml = await response.text();
      return { txnId: this.parseOtpResponse(resXml) };
    } catch (err) {
      if (err.name === 'TimeoutError') throw new InternalServerErrorException('UIDAI request timed out');
      throw err;
    }
  }

  async verifyOtp(aadhaarNumber: string, txnId: string, otp: string): Promise<UidaiKycData> {
    const pidXml = this.buildPidBlock(otp);
    const encrypted = this.encryptPidBlock(pidXml);
    const kycXml = this.buildKycRequestXml(aadhaarNumber, txnId, encrypted);
    const signedXml = this.signXml(kycXml);

    try {
      const response = await fetch(`${process.env.UIDAI_BASE_URL}/kyc/${process.env.UIDAI_AUA_CODE}/${aadhaarNumber}/${process.env.UIDAI_ASA_LICENSE_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/xml' },
        body: signedXml,
        signal: AbortSignal.timeout(10000)
      });

      const resXml = await response.text();
      return this.parseKycResponse(resXml);
    } catch (err) {
      if (err.name === 'TimeoutError') throw new InternalServerErrorException('UIDAI request timed out');
      throw err;
    }
  }

  private buildOtpRequestXml(uid: string, txn: string): string {
    return this.builder.build({
      OtpReq: {
        uid,
        ac: process.env.UIDAI_AUA_CODE,
        sa: 'public',
        ver: '1.6',
        txn,
        type: 'A',
        lk: process.env.UIDAI_ASA_LICENSE_KEY,
        Opts: { ch: '00' }
      }
    });
  }

  private buildPidBlock(otp: string): string {
    return this.builder.build({
      Pid: {
        ts: new Date().toISOString(),
        ver: '2.0',
        Pv: { otp }
      }
    });
  }

  private encryptPidBlock(pidXml: string): EncryptedPid {
    const aesKey = crypto.randomBytes(32);
    const iv = crypto.randomBytes(12);

    const cipher = crypto.createCipheriv('aes-256-gcm', aesKey, iv);
    const encData = Buffer.concat([cipher.update(pidXml, 'utf8'), cipher.final()]);
    const authTag = cipher.getAuthTag();

    const encSessionKey = crypto.publicEncrypt(
      { key: this.uidaiCert, padding: crypto.constants.RSA_PKCS1_OAEP_PADDING },
      aesKey
    );

    // Mock cert expiry for now - in prod this comes from cert metadata
    return { encData, encSessionKey, iv, authTag, certExpiry: '20251231' };
  }

  private buildKycRequestXml(uid: string, txn: string, encrypted: EncryptedPid): string {
    const dataCombined = Buffer.concat([encrypted.encData, encrypted.authTag]);
    
    return this.builder.build({
      KycReq: {
        uid,
        ac: process.env.UIDAI_AUA_CODE,
        sa: 'public',
        ver: '1.0',
        txn,
        lk: process.env.UIDAI_ASA_LICENSE_KEY,
        rc: 'Y',
        Data: {
          '#text': dataCombined.toString('base64'),
          type: 'X',
          ki: encrypted.certExpiry
        },
        Skey: {
          '#text': encrypted.encSessionKey.toString('base64'),
          ci: encrypted.certExpiry
        },
        Hmac: {
          '#text': crypto.createHmac('sha256', encrypted.encData).digest('base64') // Simplified HMAC
        }
      }
    });
  }

  private signXml(xml: string): string {
    const sig = new SignedXml();
    sig.addReference({
      xpath: "//*[local-name(.)='KycReq']",
      transforms: [
        'http://www.w3.org/2000/09/xmldsig#enveloped-signature',
        'http://www.w3.org/2001/10/xml-exc-c14n#',
      ],
      digestAlgorithm: 'http://www.w3.org/2001/04/xmlenc#sha256'
    });
    sig.privateKey = this.auaPrivateKey;
    sig.computeSignature(xml);
    return sig.getSignedXml();
  }

  private parseOtpResponse(xml: string): string {
    const res = this.parser.parse(xml);
    if (res.OtpRes?.status === '0') {
      this.mapUidaiError(res.OtpRes.err);
    }
    return res.OtpRes?.txn;
  }

  private parseKycResponse(xml: string): UidaiKycData {
    const res = this.parser.parse(xml);
    if (res.KycRes?.status === '0') {
      this.mapUidaiError(res.KycRes.err);
    }

    // In a real eKYC response, the data is encrypted. 
    // For now we assume extraction fromPoi and Poa as per prompt
    // This is a placeholder for the actual decryption/parsing of the KycRes payload
    const kycRes = res.KycRes;
    
    // Mock extraction logic since we don't have a real response payload to test decryption
    return {
      name: kycRes.Poi?.name || 'Unknown',
      dob: kycRes.Poi?.dob || 'Unknown',
      gender: kycRes.Poi?.gender || 'Unknown',
      address: kycRes.Poa ? `${kycRes.Poa.house} ${kycRes.Poa.street}` : 'Unknown',
      txnRef: kycRes.txn,
    };
  }

  private mapUidaiError(errCode: string): never {
    const msg = this.UIDAI_ERRORS[errCode] ?? `UIDAI error: ${errCode}`;
    throw new BadRequestException(msg);
  }
}
