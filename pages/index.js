import React, { useState } from 'react';
import Head from 'next/head';

export default function SkylineDashboard() {
  const [currentView, setCurrentView] = useState('home');

  // Sample data
  const stats = {
    totalExpenses: 4620.75,
    receiptsThisMonth: 12,
    pendingReceipts: 3,
    categories: 4
  };

  const recentExpenses = [
    { id: 1, title: 'Marketing Campaign', amount: 1250.00, category: 'Marketing', date: 'Today' },
    { id: 2, title: 'Office Supplies', amount: 340.50, category: 'Supplies', date: 'Yesterday' },
    { id: 3, title: 'Equipment Purchase', amount: 2100.00, category: 'Equipment', date: '2 days ago' }
  ];

  if (currentView === 'finances') {
    return <FinancesView onBack={() => setCurrentView('home')} />;
  }

  if (currentView === 'expenses') {
    return <ExpensesView onBack={() => setCurrentView('home')} />;
  }

  return (
    <>
      <Head>
        <title>Skyline Customs | Business Hub</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </Head>
      
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#000000',
        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
        color: '#FFFFFF',
        overflowX: 'hidden'
      }}>
        {/* Hero Section */}
        <div style={{
          background: 'linear-gradient(180deg, #1a1a2e 0%, #16213e 50%, #0f0f23 100%)',
          padding: '60px 24px 40px',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Gradient Orbs */}
          <div style={{
            position: 'absolute',
            top: '-50%',
            left: '-50%',
            width: '200%',
            height: '200%',
            background: 'radial-gradient(circle at 30% 30%, rgba(99, 102, 241, 0.3) 0%, transparent 50%), radial-gradient(circle at 70% 70%, rgba(139, 92, 246, 0.2) 0%, transparent 50%)',
            pointerEvents: 'none'
          }} />
          
          <div style={{ position: 'relative', zIndex: 1 }}>
            <p style={{
              fontSize: '14px',
              color: '#6366f1',
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: '2px',
              marginBottom: '12px'
            }}>
              Welcome Back
            </p>
            <h1 style={{
              fontSize: '36px',
              fontWeight: '700',
              marginBottom: '8px',
              letterSpacing: '-0.5px'
            }}>
              Skyline Customs
            </h1>
            <p style={{
              fontSize: '17px',
              color: 'rgba(255,255,255,0.6)',
              fontWeight: '400'
            }}>
              Business Hub
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div style={{ padding: '0 20px 40px' }}>
          
          {/* Quick Stats Row */}
          <div style={{
            display: 'flex',
            gap: '12px',
            marginBottom: '32px',
            overflowX: 'auto',
            paddingBottom: '8px',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none'
          }}>
            <StatPill label="This Month" value={`$${stats.totalExpenses.toLocaleString()}`} color="#6366f1" />
            <StatPill label="Receipts" value={stats.receiptsThisMonth} color="#8b5cf6" />
            <StatPill label="Pending" value={stats.pendingReceipts} color="#f59e0b" />
          </div>

          {/* Main Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Finances Card */}
            <button
              onClick={() => setCurrentView('finances')}
              style={{
                width: '100%',
                padding: '0',
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                border: 'none',
                borderRadius: '24px',
                cursor: 'pointer',
                textAlign: 'left',
                position: 'relative',
                overflow: 'hidden',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease'
              }}
              onTouchStart={(e) => e.currentTarget.style.transform = 'scale(0.98)'}
              onTouchEnd={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              <div style={{ padding: '28px' }}>
                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '16px',
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '28px',
                  marginBottom: '20px'
                }}>
                  💰
                </div>
                <h2 style={{
                  fontSize: '24px',
                  fontWeight: '700',
                  marginBottom: '8px',
                  color: '#FFFFFF'
                }}>
                  Finances
                </h2>
                <p style={{
                  fontSize: '15px',
                  color: 'rgba(255,255,255,0.8)',
                  lineHeight: '1.4'
                }}>
                  P&L reports, marketing analytics, and financial insights
                </p>
                <div style={{
                  marginTop: '20px',
                  paddingTop: '20px',
                  borderTop: '1px solid rgba(255,255,255,0.2)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)' }}>
                    View Reports
                  </span>
                  <span style={{ fontSize: '20px', color: '#FFFFFF' }}>→</span>
                </div>
              </div>
            </button>

            {/* Expense Tracker Card */}
            <button
              onClick={() => setCurrentView('expenses')}
              style={{
                width: '100%',
                padding: '0',
                background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
                border: 'none',
                borderRadius: '24px',
                cursor: 'pointer',
                textAlign: 'left',
                position: 'relative',
                overflow: 'hidden',
                transition: 'transform 0.3s ease'
              }}
              onTouchStart={(e) => e.currentTarget.style.transform = 'scale(0.98)'}
              onTouchEnd={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              <div style={{ padding: '28px' }}>
                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '16px',
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '28px',
                  marginBottom: '20px'
                }}>
                  📄
                </div>
                <h2 style={{
                  fontSize: '24px',
                  fontWeight: '700',
                  marginBottom: '8px',
                  color: '#FFFFFF'
                }}>
                  Expense Tracker
                </h2>
                <p style={{
                  fontSize: '15px',
                  color: 'rgba(255,255,255,0.8)',
                  lineHeight: '1.4'
                }}>
                  Scan receipts, track expenses, and organize business costs
                </p>
                <div style={{
                  marginTop: '20px',
                  paddingTop: '20px',
                  borderTop: '1px solid rgba(255,255,255,0.2)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)' }}>
                    {stats.receiptsThisMonth} receipts this month
                  </span>
                  <span style={{ fontSize: '20px', color: '#FFFFFF' }}>→</span>
                </div>
              </div>
            </button>
          </div>

          {/* Recent Activity */}
          <div style={{ marginTop: '32px' }}>
            <h3 style={{
              fontSize: '20px',
              fontWeight: '600',
              marginBottom: '16px',
              paddingLeft: '4px'
            }}>
              Recent Activity
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {recentExpenses.map((expense) => (
                <div key={expense.id} style={{
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  borderRadius: '16px',
                  padding: '16px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <p style={{
                      fontSize: '16px',
                      fontWeight: '600',
                      marginBottom: '4px'
                    }}>
                      {expense.title}
                    </p>
                    <p style={{
                      fontSize: '13px',
                      color: 'rgba(255,255,255,0.5)'
                    }}>
                      {expense.category} • {expense.date}
                    </p>
                  </div>
                  <p style={{
                    fontSize: '16px',
                    fontWeight: '700',
                    color: '#6366f1'
                  }}>
                    ${expense.amount.toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function StatPill({ label, value, color }) {
  return (
    <div style={{
      backgroundColor: 'rgba(255,255,255,0.05)',
      borderRadius: '16px',
      padding: '16px 20px',
      minWidth: '120px',
      border: `1px solid ${color}30`
    }}>
      <p style={{
        fontSize: '12px',
        color: 'rgba(255,255,255,0.5)',
        marginBottom: '4px',
        textTransform: 'uppercase',
        letterSpacing: '0.5px'
      }}>
        {label}
      </p>
      <p style={{
        fontSize: '20px',
        fontWeight: '700',
        color: color
      }}>
        {value}
      </p>
    </div>
  );
}

function FinancesView({ onBack }) {
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#000000',
      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
      color: '#FFFFFF',
      padding: '24px'
    }}>
      <button 
        onClick={onBack}
        style={{
          background: 'none',
          border: 'none',
          color: '#6366f1',
          fontSize: '17px',
          fontWeight: '600',
          cursor: 'pointer',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}
      >
        ← Back
      </button>
      <h1 style={{
        fontSize: '32px',
        fontWeight: '700',
        marginBottom: '24px'
      }}>
        Finances
      </h1>
      <div style={{
        background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
        borderRadius: '20px',
        padding: '24px',
        marginBottom: '20px'
      }}>
        <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)', marginBottom: '8px' }}>
          Total Expenses (This Month)
        </p>
        <p style={{ fontSize: '36px', fontWeight: '700' }}>
          $4,620.75
        </p>
      </div>
      <p style={{ color: 'rgba(255,255,255,0.5)', textAlign: 'center' }}>
        Detailed P&L reports and analytics coming soon...
      </p>
    </div>
  );
}

function ExpensesView({ onBack }) {
  const [expenses] = useState([
    { id: 1, title: 'Marketing Campaign', amount: 1250.00, category: 'Marketing', hasReceipt: true },
    { id: 2, title: 'Office Supplies', amount: 340.50, category: 'Supplies', hasReceipt: true },
    { id: 3, title: 'Equipment', amount: 2100.00, category: 'Equipment', hasReceipt: false },
    { id: 4, title: 'Utilities', amount: 180.25, category: 'Utilities', hasReceipt: true },
    { id: 5, title: 'Marketing', amount: 750.00, category: 'Marketing', hasReceipt: true }
  ]);

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#000000',
      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
      color: '#FFFFFF'
    }}>
      <div style={{ padding: '24px' }}>
        <button 
          onClick={onBack}
          style={{
            background: 'none',
            border: 'none',
            color: '#06b6d4',
            fontSize: '17px',
            fontWeight: '600',
            cursor: 'pointer',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          ← Back
        </button>
        <h1 style={{
          fontSize: '32px',
          fontWeight: '700',
          marginBottom: '24px'
        }}>
          Expense Tracker
        </h1>

        {/* Scan Button */}
        <button style={{
          width: '100%',
          padding: '20px',
          background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
          border: 'none',
          borderRadius: '16px',
          color: '#FFFFFF',
          fontSize: '17px',
          fontWeight: '600',
          cursor: 'pointer',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px'
        }}>
          <span style={{ fontSize: '24px' }}>📷</span>
          Scan New Receipt
        </button>

        {/* Expenses List */}
        <h2 style={{
          fontSize: '20px',
          fontWeight: '600',
          marginBottom: '16px'
        }}>
          Recent Expenses
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {expenses.map((expense) => (
            <div key={expense.id} style={{
              backgroundColor: 'rgba(255,255,255,0.05)',
              borderRadius: '16px',
              padding: '16px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <p style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  marginBottom: '4px'
                }}>
                  {expense.title}
                </p>
                <p style={{
                  fontSize: '13px',
                  color: 'rgba(255,255,255,0.5)'
                }}>
                  {expense.category} {expense.hasReceipt && '✓ Receipt'}
                </p>
              </div>
              <p style={{
                fontSize: '16px',
                fontWeight: '700',
                color: '#06b6d4'
              }}>
                ${expense.amount.toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}