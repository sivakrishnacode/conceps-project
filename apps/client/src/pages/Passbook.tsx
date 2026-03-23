import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePassbook, useTransactions } from '../api/queries';
import { ArrowLeft, ArrowDownRight, ArrowUpRight } from 'lucide-react';

export const Passbook = () => {
  const [activeTab, setActiveTab] = useState<'passbook' | 'transactions'>('passbook');
  const [expandedDate, setExpandedDate] = useState<string | null>(null);
  const navigate = useNavigate();

  const { data: passbookData, isLoading: loadingPassbook } = usePassbook(1);
  const { data: txData, isLoading: loadingTx } = useTransactions({ page: 1 });

  return (
    <div className="min-h-screen bg-dark-bg font-sans">
      <div className="bg-dark-card/80 backdrop-blur top-0 sticky z-20 px-4 pt-4 pb-2 border-b border-dark-border">
        <div className="flex items-center gap-4 mb-4">
          <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-white transition-colors">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-bold">Account History</h1>
        </div>

        <div className="grid grid-cols-2 gap-2 bg-dark-bg p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('passbook')}
            className={`py-2 text-sm font-medium rounded-lg transition-all ${
              activeTab === 'passbook' ? 'bg-dark-card text-white shadow' : 'text-gray-400'
            }`}
          >
            Passbook
          </button>
          <button
            onClick={() => setActiveTab('transactions')}
            className={`py-2 text-sm font-medium rounded-lg transition-all ${
              activeTab === 'transactions' ? 'bg-dark-card text-white shadow' : 'text-gray-400'
            }`}
          >
            Transactions
          </button>
        </div>
      </div>

      <div className="p-4">
        {activeTab === 'passbook' ? (
          loadingPassbook ? <p>Loading...</p> : (
            <div className="space-y-4">
              {passbookData?.map((day: any) => (
                <div key={day.createdAt} className="bg-dark-card border border-dark-border rounded-xl overflow-hidden">
                  <div 
                    className="p-4 flex justify-between items-center cursor-pointer hover:bg-white/5 transition"
                    onClick={() => setExpandedDate(expandedDate === day.createdAt ? null : day.createdAt)}
                  >
                    <div>
                      <h4 className="font-bold">{new Date(day.createdAt).toLocaleDateString()}</h4>
                      <p className="text-xs text-gray-500">{day._count.id} transactions</p>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${day._sum.amount > 0 ? 'text-green-400' : 'text-white'}`}>
                        ₹{Math.abs(day._sum.amount || 0).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              {!passbookData?.length && <p className="text-gray-500 text-center py-8">No passbook records</p>}
            </div>
          )
        ) : (
          loadingTx ? <p>Loading...</p> : (
            <div className="space-y-3">
              {txData?.transactions?.map((tx: any) => (
                <div key={tx.id} className="bg-dark-card border border-dark-border rounded-xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-full ${tx.type === 'CREDIT' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                      {tx.type === 'CREDIT' ? <ArrowDownRight size={20} /> : <ArrowUpRight size={20} />}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm">{tx.category}</h4>
                      <p className="text-xs text-gray-500">{new Date(tx.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${tx.type === 'CREDIT' ? 'text-green-400' : 'text-white'}`}>
                      {tx.type === 'CREDIT' ? '+' : '-'}₹{Number(tx.amount).toFixed(2)}
                    </p>
                    <p className="text-[10px] text-gray-600 font-mono mt-1 w-20 truncate">{tx.id}</p>
                  </div>
                </div>
              ))}
              {!txData?.transactions?.length && <p className="text-gray-500 text-center py-8">No transactions found</p>}
            </div>
          )
        )}
      </div>
    </div>
  );
};
