import React, { useState } from 'react';
import Head from 'next/head';

export default function SkylineDashboard() {
  const [currentView, setCurrentView] = useState('home');

  const stats = {
    totalExpenses: 4620.75,
    receiptsThisMonth: 12,
    pendingReceipts: 3
  };

  const recentActivity = [
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
        backgroundColor: '#F2F2F7',
        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", sans-serif',
        color: '#000000',
        WebkitFontSmoothing: 'antialiased',
        MozOsxFontSmoothing: 'grayscale'
      }}>
        {/* Header */}
        <div style={{
          backgroundColor: '#FFFFFF',
          padding: '20px 20px 16px',
          borderBottom: '1px solid #E5E5EA'
        }}>
          <p style={{
            fontSize: '13px',
            color: '#8E8E93',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            marginBottom: '4px',
            fontWeight: '500'
          }}>
            Welcome Back
          </p>
          <h1 style={{
            fontSize: '28px',
            fontWeight: '700',
            margin: 0,
            letterSpacing: '-0.5px'
          }}>
            Skyline Customs
          </h1>
          <p style={{
            fontSize: '17px',
            color: '#8E8E93',
            margin: '4px 0 0 0',
            fontWeight: '400'
          }}>
            Business Hub
          </p>
        </div>

        <div style={{ padding: '20px' }}>
          
          {/* Stats Row */}
          <div style={{
            display: 'flex',
            gap: '12px',
            marginBottom: '20px',
            overflowX: 'auto',
            paddingBottom: '4px'
          }}>
            <StatPill 
              label="This Month" 
              value={`$${stats.totalExpenses.toLocaleString()}`}
              color="#007AFF"
            />
            <StatPill 
              label="Receipts" 
              value={stats.receiptsThisMonth}
              color="#34C759"
            />
            <StatPill 
              label="Pending" 
              value={stats.pendingReceipts}
              color="#FF9500"
            />
          </div>

          {/* Main Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {/* Finances Card */}
            <button
              onClick={() => setCurrentView('finances')}
              style={{
                width: '100%',
                padding: 0,
                backgroundColor: '#FFFFFF',
                border: 'none',
                borderRadius: '16px',
                cursor: 'pointer',
                textAlign: 'left',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                overflow: 'hidden'
              }}
              onTouchStart={(e) => {
                e.currentTarget.style.transform = 'scale(0.98)';
                e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.06)';
              }}
              onTouchEnd={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
              }}
            >
              <div style={{ padding: '20px' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  backgroundColor: '#007AFF15',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px',
                  marginBottom: '16px'
                }}>
                  💰
                </div>
                <h2 style={{
                  fontSize: '20px',
                  fontWeight: '600',
                  margin: '0 0 6px 0',
                  color: '#000000'
                }}>
                  Finances
                </h2>
                <p style={{
                  fontSize: '15px',
                  color: '#8E8E93',
                  margin: 0,
                  lineHeight: '1.4'
                }}>
                  P&L reports, marketing analytics, and financial insights
                </p>
                <div style={{
                  marginTop: '16px',
                  paddingTop: '16px',
                  borderTop: '1px solid #E5E5EA',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span style={{ fontSize: '15px', color: '#007AFF', fontWeight: '500' }}>
                    View Reports
                  </span>
                  <span style={{ fontSize: '18px', color: '#C7C7CC' }}>›</span>
                </div>
              </div>
            </button>

            {/* Expense Tracker Card */}
            <button
              onClick={() => setCurrentView('expenses')}
              style={{
                width: '100%',
                padding: 0,
                backgroundColor: '#FFFFFF',
                border: 'none',
                borderRadius: '16px',
                cursor: 'pointer',
                textAlign: 'left',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                overflow: 'hidden'
              }}
              onTouchStart={(e) => {
                e.currentTarget.style.transform = 'scale(0.98)';
                e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.06)';
              }}
              onTouchEnd={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
              }}
            >
              <div style={{ padding: '20px' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  backgroundColor: '#34C75915',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px',
                  marginBottom: '16px'
                }}>
                  📄
                </div>
                <h2 style={{
                  fontSize: '20px',
                  fontWeight: '600',
                  margin: '0 0 6px 0',
                  color: '#000000'
                }}>
                  Expense Tracker
                </h2>
                <p style={{
                  fontSize: '15px',
                  color: '#8E8E93',
                  margin: 0,
                  lineHeight: '1.4'
                }}>
                  Scan receipts, track expenses, and organize business costs
                </p>
                <div style={{
                  marginTop: '16px',
                  paddingTop: '16px',
                  borderTop: '1px solid #E5E5EA',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span style={{ fontSize: '15px', color: '#8E8E93' }}>
                    {stats.receiptsThisMonth} receipts this month
                  </span>
                  <span style={{ fontSize: '18px', color: '#C7C7CC' }}>›</span>
                </div>
              </div>
            </button>
          </div>

          {/* Recent Activity */}
          <div style={{ marginTop: '24px' }}>
            <h3 style={{
              fontSize: '20px',
              fontWeight: '600',
              margin: '0 0 12px 0',
              paddingLeft: '4px'
            }}>
              Recent Activity
            </h3>
            <div style={{ 
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              overflow: 'hidden',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
            }}>
              {recentActivity.map((item, index) => (
                <div key={item.id} style={{
                  padding: '16px',
                  borderBottom: index < recentActivity.length - 1 ? '1px solid #E5E5EA' : 'none',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <p style={{
                      fontSize: '16px',
                      fontWeight: '600',
                      margin: '0 0 4px 0',
                      color: '#000000'
                    }}>
                      {item.title}
                    </p>
                    <p style={{
                      fontSize: '13px',
                      color: '#8E8E93',
                      margin: 0
                    }}>
                      {item.category} • {item.date}
                    </p>
                  </div>
                  <p style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#000000'
                  }}>
                    ${item.amount.toLocaleString()}
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
      backgroundColor: '#FFFFFF',
      borderRadius: '12px',
      padding: '12px 16px',
      minWidth: '110px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
    }}>
      <p style={{
        fontSize: '11px',
        color: '#8E8E93',
        margin: '0 0 4px 0',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        fontWeight: '500'
      }}>
        {label}
      </p>
      <p style={{
        fontSize: '17px',
        fontWeight: '700',
        color: color,
        margin: 0
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
      backgroundColor: '#F2F2F7',
      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif'
    }}>
      {/* Header */}
      <div style={{
        backgroundColor: '#FFFFFF',
        padding: '16px 20px',
        borderBottom: '1px solid #E5E5EA',
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
        <button 
          onClick={onBack}
          style={{
            background: 'none',
            border: 'none',
            color: '#007AFF',
            fontSize: '17px',
            fontWeight: '400',
            cursor: 'pointer',
            padding: 0
          }}
        >
          ‹ Back
        </button>
        <h1 style={{
          fontSize: '17px',
          fontWeight: '600',
          margin: 0,
          flex: 1,
          textAlign: 'center'
        }}>
          Finances
        </h1>
        <div style={{ width: '50px' }} />
      </div>

      <div style={{ padding: '20px' }}>
        {/* Total Card */}
        <div style={{
          backgroundColor: '#007AFF',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '20px'
        }}>
          <p style={{
            fontSize: '15px',
            color: 'rgba(255,255,255,0.8)',
            margin: '0 0 8px 0'
          }}>
            Total Expenses (This Month)
          </p>
          <p style={{
            fontSize: '34px',
            fontWeight: '700',
            color: '#FFFFFF',
            margin: 0,
            letterSpacing: '-0.5px'
          }}>
            $4,620.75
          </p>
        </div>

        <p style={{
          color: '#8E8E93',
          textAlign: 'center',
          fontSize: '15px'
        }}>
          Detailed P&L reports and analytics coming soon...
        </p>
      </div>
    </div>
  );
}

function ExpensesView({ onBack }) {
  const expenses = [
    { id: 1, title: 'Marketing Campaign', amount: 1250.00, category: 'Marketing', hasReceipt: true },
    { id: 2, title: 'Office Supplies', amount: 340.50, category: 'Supplies', hasReceipt: true },
    { id: 3, title: 'Equipment', amount: 2100.00, category: 'Equipment', hasReceipt: false },
    { id: 4, title: 'Utilities', amount: 180.25, category: 'Utilities', hasReceipt: true },
    { id: 5, title: 'Marketing', amount: 750.00, category: 'Marketing', hasReceipt: true }
  ];

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#F2F2F7',
      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif'
    }}>
      {/* Header */}
      <div style={{
        backgroundColor: '#FFFFFF',
        padding: '16px 20px',
        borderBottom: '1px solid #E5E5EA',
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
        <button 
          onClick={onBack}
          style={{
            background: 'none',
            border: 'none',
            color: '#007AFF',
            fontSize: '17px',
            fontWeight: '400',
            cursor: 'pointer',
            padding: 0
          }}
        >
          ‹ Back
        </button>
        <h1 style={{
          fontSize: '17px',
          fontWeight: '600',
          margin: 0,
          flex: 1,
          textAlign: 'center'
        }}>
          Expense Tracker
        </h1>
        <div style={{ width: '50px' }} />
      </div>

      <div style={{ padding: '20px' }}>
        {/* Scan Button */}
        <button style={{
          width: '100%',
          padding: '16px',
          backgroundColor: '#34C759',
          border: 'none',
          borderRadius: '12px',
          color: '#FFFFFF',
          fontSize: '17px',
          fontWeight: '600',
          cursor: 'pointer',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px'
        }}>
          <span style={{ fontSize: '20px' }}>📷</span>
          Scan New Receipt
        </button>

        {/* Expenses List */}
        <h2 style={{
          fontSize: '20px',
          fontWeight: '600',
          margin: '0 0 12px 4px'
        }}>
          Recent Expenses
        </h2>
        <div style={{ 
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
        }}>
          {expenses.map((expense, index) => (
            <div key={expense.id} style={{
              padding: '16px',
              borderBottom: index < expenses.length - 1 ? '1px solid #E5E5EA' : 'none',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <p style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  margin: '0 0 4px 0',
                  color: '#000000'
                }}>
                  {expense.title}
                </p>
                <p style={{
                  fontSize: '13px',
                  color: '#8E8E93',
                  margin: 0
                }}>
                  {expense.category} {expense.hasReceipt && '• Receipt saved'}
                </p>
              </div>
              <p style={{
                fontSize: '16px',
                fontWeight: '600',
                color: '#000000'
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