import React, { useState } from 'react';
import Head from 'next/head';

export default function SkylineDashboard() {
  const [currentView, setCurrentView] = useState('home');

  const stats = {
    totalExpenses: 0.00,
    receiptsScanned: 0,
    thisMonth: 0
  };

  if (currentView === 'finances') {
    return <FinancesView onBack={() => setCurrentView('home')} />;
  }

  if (currentView === 'expenses') {
    return <ExpensesView onBack={() => setCurrentView('home')} />;
  }

  return (
    <>
      <Head>
        <title>Skyline Business Hub</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </Head>
      
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        color: '#FFFFFF',
        padding: '0 0 40px 0'
      }}>
        {/* Header Section */}
        <div style={{ padding: '60px 24px 30px' }}>
          <p style={{
            fontSize: '14px',
            color: 'rgba(255,255,255,0.6)',
            marginBottom: '8px',
            fontWeight: '400'
          }}>
            Welcome Back
          </p>
          <h1 style={{
            fontSize: '32px',
            fontWeight: '700',
            margin: '0 0 4px 0',
            color: '#FFFFFF'
          }}>
            Skyline Customs
          </h1>
          <p style={{
            fontSize: '18px',
            color: 'rgba(255,255,255,0.7)',
            margin: 0
          }}>
            Business Hub
          </p>
        </div>

        {/* Main Cards */}
        <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Finances Card */}
          <button
            onClick={() => setCurrentView('finances')}
            style={{
              width: '100%',
              padding: 0,
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%)',
              border: 'none',
              borderRadius: '20px',
              cursor: 'pointer',
              textAlign: 'left',
              overflow: 'hidden',
              transition: 'transform 0.2s ease'
            }}
            onTouchStart={(e) => e.currentTarget.style.transform = 'scale(0.98)'}
            onTouchEnd={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            <div style={{ padding: '28px' }}>
              {/* Icon */}
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '16px',
                backgroundColor: 'rgba(255,255,255,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '28px',
                marginBottom: '20px',
                backdropFilter: 'blur(10px)'
              }}>
                💰
              </div>
              
              <h2 style={{
                fontSize: '24px',
                fontWeight: '700',
                margin: '0 0 10px 0',
                color: '#FFFFFF'
              }}>
                Finances
              </h2>
              
              <p style={{
                fontSize: '15px',
                color: 'rgba(255,255,255,0.8)',
                margin: '0 0 20px 0',
                lineHeight: '1.5'
              }}>
                Marketing analytics, P&L reports, and financial insights
              </p>
              
              <div style={{
                display: 'flex',
                gap: '12px',
                marginBottom: '20px'
              }}>
                <span style={{
                  padding: '8px 16px',
                  backgroundColor: 'rgba(255,255,255,0.15)',
                  borderRadius: '20px',
                  fontSize: '13px',
                  color: '#FFFFFF',
                  fontWeight: '500'
                }}>
                  P&L Reports
                </span>
                <span style={{
                  padding: '8px 16px',
                  backgroundColor: 'rgba(255,255,255,0.15)',
                  borderRadius: '20px',
                  fontSize: '13px',
                  color: '#FFFFFF',
                  fontWeight: '500'
                }}>
                  Analytics
                </span>
              </div>
              
              <div style={{
                paddingTop: '16px',
                borderTop: '1px solid rgba(255,255,255,0.2)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span style={{ fontSize: '15px', color: 'rgba(255,255,255,0.9)', fontWeight: '600' }}>
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
              padding: 0,
              background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 50%, #0e7490 100%)',
              border: 'none',
              borderRadius: '20px',
              cursor: 'pointer',
              textAlign: 'left',
              overflow: 'hidden',
              transition: 'transform 0.2s ease'
            }}
            onTouchStart={(e) => e.currentTarget.style.transform = 'scale(0.98)'}
            onTouchEnd={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            <div style={{ padding: '28px' }}>
              {/* Icon */}
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '16px',
                backgroundColor: 'rgba(255,255,255,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '28px',
                marginBottom: '20px',
                backdropFilter: 'blur(10px)'
              }}>
                📄
              </div>
              
              <h2 style={{
                fontSize: '24px',
                fontWeight: '700',
                margin: '0 0 10px 0',
                color: '#FFFFFF'
              }}>
                Expense Tracker
              </h2>
              
              <p style={{
                fontSize: '15px',
                color: 'rgba(255,255,255,0.8)',
                margin: '0 0 20px 0',
                lineHeight: '1.5'
              }}>
                Scan receipts, track expenses, and organize business costs
              </p>
              
              <div style={{
                display: 'flex',
                gap: '20px',
                marginBottom: '20px'
              }}>
                <div>
                  <span style={{
                    fontSize: '28px',
                    fontWeight: '700',
                    color: '#FFFFFF'
                  }}>
                    {stats.receiptsScanned}
                  </span>
                  <p style={{
                    fontSize: '13px',
                    color: 'rgba(255,255,255,0.7)',
                    margin: '4px 0 0 0'
                  }}>
                    Receipts
                  </p>
                </div>
                <div>
                  <span style={{
                    fontSize: '28px',
                    fontWeight: '700',
                    color: '#FFFFFF'
                  }}>
                    ${stats.totalExpenses.toFixed(2)}
                  </span>
                  <p style={{
                    fontSize: '13px',
                    color: 'rgba(255,255,255,0.7)',
                    margin: '4px 0 0 0'
                  }}>
                    Tracked
                  </p>
                </div>
              </div>
            </div>
          </button>
        </div>

        {/* Quick Overview Section */}
        <div style={{ padding: '30px 20px 0' }}>
          <h3 style={{
            fontSize: '18px',
            fontWeight: '600',
            margin: '0 0 16px 4px',
            color: 'rgba(255,255,255,0.9)'
          }}>
            Quick Overview
          </h3>
          
          <div style={{
            display: 'flex',
            gap: '12px',
            overflowX: 'auto',
            paddingBottom: '8px'
          }}>
            <OverviewCard 
              label="Total Expenses" 
              value={`$${stats.totalExpenses.toFixed(2)}`}
            />
            <OverviewCard 
              label="Receipts Scanned" 
              value={stats.receiptsScanned.toString()}
            />
            <OverviewCard 
              label="This Month" 
              value={stats.thisMonth.toString()}
            />
          </div>
        </div>
      </div>
    </>
  );
}

function OverviewCard({ label, value }) {
  return (
    <div style={{
      backgroundColor: 'rgba(255,255,255,0.08)',
      borderRadius: '16px',
      padding: '16px 20px',
      minWidth: '140px',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255,255,255,0.1)'
    }}>
      <p style={{
        fontSize: '12px',
        color: 'rgba(255,255,255,0.6)',
        margin: '0 0 6px 0',
        fontWeight: '500'
      }}>
        {label}
      </p>
      <p style={{
        fontSize: '22px',
        fontWeight: '700',
        color: '#FFFFFF',
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
      background: 'linear-gradient(180deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      color: '#FFFFFF'
    }}>
      <div style={{ padding: '60px 24px 30px' }}>
        <button 
          onClick={onBack}
          style={{
            background: 'none',
            border: 'none',
            color: '#FFFFFF',
            fontSize: '17px',
            cursor: 'pointer',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: 0
          }}
        >
          ← Back
        </button>
        <h1 style={{
          fontSize: '28px',
          fontWeight: '700'
        }}>
          Finances
        </h1>
      </div>
      
      <div style={{ padding: '0 24px' }}>
        <p style={{ color: 'rgba(255,255,255,0.6)' }}>Finance details coming soon...</p>
      </div>
    </div>
  );
}

function ExpensesView({ onBack }) {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      color: '#FFFFFF'
    }}>
      <div style={{ padding: '60px 24px 30px' }}>
        <button 
          onClick={onBack}
          style={{
            background: 'none',
            border: 'none',
            color: '#FFFFFF',
            fontSize: '17px',
            cursor: 'pointer',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: 0
          }}
        >
          ← Back
        </button>
        <h1 style={{
          fontSize: '28px',
          fontWeight: '700'
        }}>
          Expense Tracker
        </h1>
      </div>
      
      <div style={{ padding: '0 24px' }}>
        <button style={{
          width: '100%',
          padding: '18px',
          background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
          border: 'none',
          borderRadius: '16px',
          color: '#FFFFFF',
          fontSize: '17px',
          fontWeight: '600',
          cursor: 'pointer',
          marginBottom: '20px'
        }}>
          📷 Scan Receipt
        </button>
        <p style={{ color: 'rgba(255,255,255,0.6)' }}>Expense tracking coming soon...</p>
      </div>
    </div>
  );
}