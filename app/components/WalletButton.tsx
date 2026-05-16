'use client'

import { ConnectButton } from '@rainbow-me/rainbowkit'
import { sdk } from '@farcaster/miniapp-sdk'
import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useAccount, useConnect } from 'wagmi'
import { useMiniKit } from '@coinbase/onchainkit/minikit'

export function WalletButton({ onConnectClick }: { onConnectClick?: () => void }) {
  const [context, setContext] = useState<{ user?: { username?: string; fid?: number | string; pfpUrl?: string } } | null>(null)
  const [isInMiniApp, setIsInMiniApp] = useState(false)
  const [ready, setReady] = useState(false)
  const [isConnectOpen, setIsConnectOpen] = useState(false)
  const [connectError, setConnectError] = useState<string | null>(null)
  const [connectingId, setConnectingId] = useState<string | null>(null)
  const [isClient, setIsClient] = useState(false)
  const { address, isConnected } = useAccount()
  const { connectAsync, connectors, isPending } = useConnect()
  const { context: miniKitContext } = useMiniKit()
  const profileSavedRef = useRef(false)

  // Initialize SDK context and check if in MiniApp
  useEffect(() => {
    setIsClient(true)
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

  const connectorMap = useMemo(() => {
    const match = (predicate: (connector: (typeof connectors)[number]) => boolean) =>
      connectors.find((connector) => predicate(connector))

    return {
      farcaster: match(
        (connector) =>
          connector.id?.toLowerCase().includes('farcaster') ||
          connector.name?.toLowerCase().includes('farcaster')
      ),
      injected: match(
        (connector) =>
          connector.id === 'injected' ||
          connector.name?.toLowerCase().includes('injected') ||
          connector.name?.toLowerCase().includes('metamask')
      ),
      coinbase: match(
        (connector) =>
          connector.id?.toLowerCase().includes('coinbase') ||
          connector.name?.toLowerCase().includes('coinbase') ||
          connector.name?.toLowerCase().includes('base')
      ),
      walletConnect: match(
        (connector) =>
          connector.id?.toLowerCase().includes('walletconnect') ||
          connector.name?.toLowerCase().includes('walletconnect')
      ),
    }
  }, [connectors])

  const walletOptions = useMemo(
    () => [
      {
        key: 'farcaster',
        label: 'Farcaster Wallet',
        description: 'Farcaster Mini App',
        iconSrc: '/wallets/farcaster.png',
        iconAlt: 'Farcaster',
        connector: connectorMap.farcaster,
        requiresMiniApp: true,
      },
      {
        key: 'external',
        label: 'External Wallet',
        description: 'Browser wallet (MetaMask)',
        iconSrc: '/wallets/metamask.svg',
        iconAlt: 'MetaMask',
        connector: connectorMap.injected,
      },
      {
        key: 'base',
        label: 'Base Wallet',
        description: 'Coinbase Wallet',
        iconSrc: '/wallets/coinbasewallet.ico',
        iconAlt: 'Coinbase Wallet',
        connector: connectorMap.coinbase,
      },
      {
        key: 'walletconnect',
        label: 'WalletConnect',
        description: 'QR or mobile wallet',
        iconSrc: '/wallets/walletconnect.png',
        iconAlt: 'WalletConnect',
        connector: connectorMap.walletConnect,
      },
    ],
    [connectorMap]
  )

  const connectWith = async (connector: (typeof connectors)[number] | undefined, optionKey: string) => {
    if (!connector) return
    setConnectError(null)
    setConnectingId(optionKey)
    try {
      await connectAsync({ connector })
      setIsConnectOpen(false)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to connect wallet.'
      setConnectError(message)
    } finally {
      setConnectingId(null)
    }
  }

  const miniKitUser = miniKitContext?.user as
    | { username?: string; fid?: number | string; pfpUrl?: string }
    | undefined
  const activeUser = miniKitUser ?? context?.user

  // Save profile to database when wallet connects
  useEffect(() => {
    if (isConnected && address && activeUser && !profileSavedRef.current) {
      const saveProfile = async () => {
        try {
          const user = activeUser
          const profileData = {
            address,
            fid: user?.fid ?? null,
            username: user?.username ?? address,
            pfpUrl: user?.pfpUrl ?? null,
          }

          const response = await fetch('/api/save-profile', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(profileData),
          })

          if (response.ok) {
            console.log('✅ Profile saved for address:', address, profileData)
            profileSavedRef.current = true
          } else {
            console.warn('❌ Failed to save profile:', response.statusText)
          }
        } catch (error) {
          console.warn('❌ Error saving profile:', error)
        }
      }

      saveProfile()
    }
  }, [isConnected, address, activeUser])

  useEffect(() => {
    if (isConnected) {
      setIsConnectOpen(false)
    }
  }, [isConnected])

  const modalRoot = isClient ? document.body : null

  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
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
                  <>
                    <button
                      onClick={() => {
                        setConnectError(null)
                        setIsConnectOpen(true)
                        onConnectClick?.()
                      }}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-2 px-3 md:px-6 rounded-lg md:rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg text-xs md:text-base"
                    >
                      <span className="hidden sm:inline">Connect Wallet</span>
                      <span className="sm:hidden">Connect</span>
                    </button>

                    {isConnectOpen &&
                      modalRoot &&
                      createPortal(
                        <div className="fixed inset-0 z-50 grid place-items-center p-4">
                          <div
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                            onClick={() => {
                              setConnectError(null)
                              setIsConnectOpen(false)
                            }}
                          />
                          <div className="relative w-full max-w-md mm-card mm-card-strong rounded-2xl border p-4 md:p-6 shadow-2xl">
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <h3 className="text-lg font-semibold" style={{ color: "var(--mm-text)" }}>
                                  Connect Wallet
                                </h3>
                                <p className="text-sm" style={{ color: "var(--mm-muted)" }}>
                                  Choose a wallet to continue.
                                </p>
                              </div>
                              <button
                                onClick={() => {
                                  setConnectError(null)
                                  setIsConnectOpen(false)
                                }}
                                className="h-8 w-8 rounded-full border text-sm transition-all"
                                style={{ borderColor: "var(--mm-border)", color: "var(--mm-muted)" }}
                              >
                                ✕
                              </button>
                            </div>

                            <div className="mt-4 space-y-3">
                              {walletOptions.map((option) => {
                                const connector = option.connector
                                const connectorReady =
                                  (connector as { ready?: boolean } | undefined)?.ready ?? true
                                const needsMiniApp = option.requiresMiniApp && !isInMiniApp
                                const isDisabled = !connector || !connectorReady || needsMiniApp
                              const isConnecting = connectingId === option.key || isPending

                                return (
                                  <button
                                    key={option.key}
                                    disabled={isDisabled || isConnecting}
                                    onClick={() => connectWith(connector, option.key)}
                                    className="w-full text-left px-4 py-3 rounded-xl border transition-all"
                                  style={{
                                    borderColor: "var(--mm-border)",
                                    background: isDisabled ? "var(--mm-surface)" : "var(--mm-surface-2)",
                                    color: "var(--mm-text)",
                                    opacity: isDisabled ? 0.55 : 1,
                                  }}
                                >
                                  <div className="flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-3">
                                      <div
                                        className="h-9 w-9 rounded-full flex items-center justify-center border"
                                        style={{
                                          borderColor: "var(--mm-border)",
                                          background: "var(--mm-surface)",
                                        }}
                                      >
                                        <img
                                          src={option.iconSrc}
                                          alt={option.iconAlt}
                                          className="h-5 w-5 object-contain"
                                          loading="lazy"
                                        />
                                      </div>
                                      <div>
                                        <div className="text-sm font-semibold">{option.label}</div>
                                        <div className="text-xs" style={{ color: "var(--mm-faint)" }}>
                                          {needsMiniApp ? 'Mini App only' : option.description}
                                        </div>
                                      </div>
                                    </div>
                                    <div className="text-xs" style={{ color: "var(--mm-muted)" }}>
                                      {isConnecting ? 'Connecting...' : 'Select'}
                                    </div>
                                  </div>
                                  </button>
                                )
                              })}
                            </div>

                            {connectError && (
                              <p className="mt-3 text-xs" style={{ color: "#f87171" }}>
                                {connectError}
                              </p>
                            )}

                            <p className="mt-4 text-[11px]" style={{ color: "var(--mm-faint)" }}>
                              Need help? Make sure your wallet is unlocked and set to Base Mainnet.
                            </p>
                          </div>
                        </div>,
                        modalRoot
                      )}
                  </>
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
                    {activeUser?.pfpUrl && (
                      <img
                        src={activeUser?.pfpUrl}
                        alt="PFP"
                        className="w-6 h-6 rounded-full object-cover"
                      />
                    )}
                    {activeUser?.username ?? account.displayName}
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
                  <div className="absolute right-0 mt-2 w-56 mm-card mm-card-strong rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="p-4 border-b" style={{ borderColor: "var(--mm-border)" }}>
                      <p className="text-xs" style={{ color: "var(--mm-faint)" }}>Connected Wallet</p>
                      <p className="text-sm font-mono break-all" style={{ color: "var(--mm-text)" }}>{account.displayName}</p>
                    </div>
                    {activeUser && (
                      <div className="p-4 border-b" style={{ borderColor: "var(--mm-border)" }}>
                        <p className="text-xs" style={{ color: "var(--mm-faint)" }}>Farcaster User</p>
                        <p className="text-sm" style={{ color: "var(--mm-text)" }}>@{activeUser?.username ?? 'Unknown'}</p>
                        <p className="text-xs" style={{ color: "var(--mm-faint)" }}>FID: {activeUser?.fid ?? '—'}</p>
                      </div>
                    )}
                    <button
                      onClick={openAccountModal}
                      className="w-full text-left px-4 py-3 rounded-b-xl transition-all text-sm"
                      style={{ color: "var(--mm-accent)" }}
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
