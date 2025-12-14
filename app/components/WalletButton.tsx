'use client'

import { ConnectButton } from '@rainbow-me/rainbowkit'
import { sdk } from '@farcaster/miniapp-sdk'
import { useEffect, useState } from 'react'

export function WalletButton({ onConnectClick }: { onConnectClick?: () => void }) {
  const [context, setContext] = useState<{ user?: { username?: string; fid?: number; pfpUrl?: string } } | null>(null)
  const [isInMiniApp, setIsInMiniApp] = useState(false)
  const [ready, setReady] = useState(false)

  // Initialize SDK context and check if in MiniApp
  useEffect(() => {
    const init = async () => {
      try {
        const ctx = await sdk.context
        setContext(ctx)
        const inMiniApp = await sdk.isInMiniApp()
        setIsInMiniApp(inMiniApp)

        if (inMiniApp) {
          console.log('Running in Farcaster MiniApp context')
        }
      } catch (error) {
        console.log('Not in Farcaster MiniApp:', error)
        setIsInMiniApp(false)
      }
    }
    init()
  }, [])

  // Auto-connect to Farcaster Wallet when in MiniApp
  useEffect(() => {
    if (!isInMiniApp) return

    // Signal ready for MiniApp
    if (!ready) {
      sdk.actions.ready()
      setReady(true)
    }
  }, [isInMiniApp, ready])

  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        authenticationStatus,
        mounted,
      }) => {
        // Note: If your app doesn't use authentication, you
        // can remove all 'authenticationStatus' checks
        const ready = mounted && authenticationStatus !== 'loading'
        const connected =
          ready &&
          account &&
          chain &&
          (!authenticationStatus || authenticationStatus === 'authenticated')

        return (
          <div
            {...(!ready && {
              'aria-hidden': true,
              style: {
                opacity: 0,
                pointerEvents: 'none',
                userSelect: 'none',
              },
            })}
          >
            {(() => {
              if (!connected) {
                return (
                  <button
                    onClick={() => {
                      openConnectModal()
                      onConnectClick?.()
                    }}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-2 px-3 md:px-6 rounded-lg md:rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg text-xs md:text-base"
                  >
                    <span className="hidden sm:inline">Connect Wallet</span>
                    <span className="sm:hidden">Connect</span>
                  </button>
                )
              }

              if (chain.unsupported) {
                return (
                  <button onClick={openChainModal} type="button">
                    Wrong network
                  </button>
                )
              }

              return (
                <div className="relative group">
                  <button
                    onClick={openAccountModal}
                    type="button"
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-2 px-3 md:px-6 rounded-lg md:rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg text-xs md:text-base flex items-center gap-2"
                  >
                    {context?.user?.pfpUrl && (
                      <img
                        src={context.user.pfpUrl}
                        alt="PFP"
                        className="w-6 h-6 rounded-full object-cover"
                      />
                    )}
                    {context?.user?.username || account.displayName}
                    {chain.hasIcon && (
                      <div
                        style={{
                          background: chain.iconBackground,
                          width: 12,
                          height: 12,
                          borderRadius: 999,
                          overflow: 'hidden',
                          marginRight: 4,
                        }}
                      >
                        {chain.iconUrl && (
                          <img
                            alt={chain.name ?? 'Chain icon'}
                            src={chain.iconUrl}
                            style={{ width: 12, height: 12 }}
                          />
                        )}
                      </div>
                    )}
                  </button>

                  {/* Dropdown on hover */}
                  <div className="absolute right-0 mt-2 w-48 bg-gray-900 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="p-4 border-b border-gray-700">
                      <p className="text-xs text-gray-400">Connected Wallet</p>
                      <p className="text-sm font-mono text-white break-all">{account.displayName}</p>
                    </div>
                    {context?.user && (
                      <div className="p-4 border-b border-gray-700">
                        <p className="text-xs text-gray-400">Farcaster User</p>
                        <p className="text-sm text-white">@{context.user.username || 'Unknown'}</p>
                        <p className="text-xs text-gray-400">FID: {context.user.fid}</p>
                      </div>
                    )}
                    <button
                      onClick={openAccountModal}
                      className="w-full text-left px-4 py-3 text-blue-400 hover:bg-blue-500/10 rounded-b-xl transition-all text-sm"
                    >
                      Wallet Options
                    </button>
                  </div>
                </div>
              )
            })()}
          </div>
        )
      }}
    </ConnectButton.Custom>
  )
}