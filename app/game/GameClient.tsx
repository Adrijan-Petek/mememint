"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { sdk } from "@farcaster/miniapp-sdk";
import { useAccount, usePublicClient, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { base } from "wagmi/chains";
import { formatEther } from "viem";
import { MEMEBLAST_FEES_ABI } from "../contracts/MemeBlastFeesABI";
import { CONTRACT_ADDRESSES } from "../contracts/addresses";
import { WalletButton } from "../components/WalletButton";
import { useScoring } from "../hooks/useScoring";

type UpgradeKey = "fireRate" | "multiShot" | "bulletSpeed" | "damage";
type UpgradeState = Record<UpgradeKey, number>;

type Player = {
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
};

type Bullet = {
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  damage: number;
};

type Enemy = {
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  health: number;
  points: number;
  sprite: HTMLImageElement | null;
  coinDrop: number;
  heartDrop: boolean;
  tint: string;
};

type Coin = {
  x: number;
  y: number;
  width: number;
  height: number;
  vy: number;
  settled: boolean;
};

type HeartPickup = {
  x: number;
  y: number;
  width: number;
  height: number;
  vy: number;
};

type EnemyShot = {
  x: number;
  y: number;
  width: number;
  height: number;
  vx: number;
  vy: number;
  damage: number;
};

type Boss = {
  x: number;
  y: number;
  width: number;
  height: number;
  health: number;
  maxHealth: number;
  speedY: number;
  direction: number;
  lastShotAt: number;
  shotInterval: number;
  sprite: HTMLImageElement | null;
};

type GameState = {
  player: Player;
  bullets: Bullet[];
  enemies: Enemy[];
  coins: Coin[];
  heartsPickups: HeartPickup[];
  coinsCollected: number;
  enemyShots: EnemyShot[];
  boss: Boss | null;
  bossSpawned: boolean;
  bossDefeated: boolean;
  running: boolean;
  gameOver: boolean;
  score: number;
  hearts: number;
  level: number;
  groundHits: number;
  spawnTimer: number;
  lastShotAt: number;
  lastFrameAt: number;
};

const STORAGE_KEYS = {
  upgrades: "mememint-dodge-upgrades",
  bank: "mememint-dodge-bank",
};

const DEFAULT_UPGRADES: UpgradeState = {
  fireRate: 0,
  multiShot: 0,
  bulletSpeed: 0,
  damage: 0,
};

const MAX_UPGRADES: Record<UpgradeKey, number> = {
  fireRate: 6,
  multiShot: 3,
  bulletSpeed: 5,
  damage: 4,
};

const UPGRADE_CONFIG: Record<
  UpgradeKey,
  { label: string; description: string; baseCost: number; multiplier: number }
> = {
  fireRate: {
    label: "Fire Rate",
    description: "Shoot faster",
    baseCost: 80,
    multiplier: 1.6,
  },
  multiShot: {
    label: "Multi-Shot",
    description: "More bullets per shot",
    baseCost: 140,
    multiplier: 1.7,
  },
  bulletSpeed: {
    label: "Projectile Speed",
    description: "Bullets travel faster",
    baseCost: 110,
    multiplier: 1.55,
  },
  damage: {
    label: "Damage",
    description: "Deal more damage",
    baseCost: 120,
    multiplier: 1.7,
  },
};

const ENEMY_MANIFEST_URL = "/game/enemies/manifest.json";
const DEFAULT_ENEMY_IMAGES = [
  "/game/enemies/enemy-1.png",
  "/game/enemies/enemy-2.png",
  "/game/enemies/enemy-3.png",
  "/game/enemies/enemy-4.png",
  "/game/enemies/enemy-5.png",
  "/game/enemies/object-1.png",
  "/game/enemies/object-2.png",
];
const PLAYER_IMAGE = "/game/player/logo.png";
const COIN_IMAGE = "/game/enemies/coin.png";
const HEART_IMAGE = "/game/enemies/heart.png";
const SHOT_SOUND = "/game/sound/shot.mp3";
const COIN_SOUND = "/game/sound/coin.mp3";
const HIT_SOUND = "/game/sound/hit.mp3";
const BOSS_LAUGH_SOUND = "/game/sound/boss-laugh.mp3";
const BOSS_SHOOT_SOUND = "/game/sound/boss-shoot.mp3";
const PLAYER_HIT_SOUND = "/game/sound/player-hit.mp3";
const HEALTH_PICKUP_SOUND = "/game/sound/health-pickup.mp3";
const BACKGROUND_MUSIC = "/game/sound/game-background.mp3";

const HEARTS_TOTAL = 5;
const MAX_GROUND_HITS = 10;
const BOSS_LEVEL = 5;
const BOSS_BASE_HEALTH = 36;
const BOSS_SHOT_INTERVAL_MS = 900;
const BOSS_BULLET_SPEED = 260;
const COIN_GRAVITY = 520;
const COIN_BOUNCE = 0.55;
const COIN_SETTLE_SPEED = 40;
const HEART_GRAVITY = 520;
const BASE_FIRE_RATE_MS = 520;
const BASE_BULLET_SPEED = 680;
const BASE_PLAYER_SPEED = 360;

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));
const randomBetween = (min: number, max: number) => min + Math.random() * (max - min);
const randomPick = <T,>(items: T[]) => items[Math.floor(Math.random() * items.length)];

const getUpgradeCost = (key: UpgradeKey, level: number) => {
  const config = UPGRADE_CONFIG[key];
  return Math.floor(config.baseCost * Math.pow(config.multiplier, level));
};

const getFireInterval = (level: number) => Math.max(240, BASE_FIRE_RATE_MS - level * 35);
const getBulletSpeed = (level: number) => BASE_BULLET_SPEED + level * 140;
const getDamage = (level: number) => 1 + level;
const getShotCount = (level: number) => clamp(1 + level, 1, 4);

const getSpawnInterval = (level: number) => Math.max(0.35, 1.15 - level * 0.055);
const getEnemySpeed = (level: number) => 130 + level * 12;
const getEnemyHealth = (level: number) => Math.min(1 + Math.floor(level / 4), 5);

const colorPalette = ["#8b5cf6", "#06b6d4", "#f472b6", "#22c55e", "#f59e0b"];

export default function GameClient() {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const sizeRef = useRef({ width: 0, height: 0, dpr: 1 });
  const shotSoundsRef = useRef<HTMLAudioElement[]>([]);
  const shotSoundIndexRef = useRef(0);
  const coinSoundsRef = useRef<HTMLAudioElement[]>([]);
  const coinSoundIndexRef = useRef(0);
  const hitSoundsRef = useRef<HTMLAudioElement[]>([]);
  const hitSoundIndexRef = useRef(0);
  const bossLaughSoundRef = useRef<HTMLAudioElement | null>(null);
  const bossShootSoundsRef = useRef<HTMLAudioElement[]>([]);
  const bossShootSoundIndexRef = useRef(0);
  const playerHitSoundsRef = useRef<HTMLAudioElement[]>([]);
  const playerHitSoundIndexRef = useRef(0);
  const healthPickupSoundRef = useRef<HTMLAudioElement | null>(null);
  const backgroundMusicRef = useRef<HTMLAudioElement | null>(null);
  const musicEnabledRef = useRef(true);
  const sfxEnabledRef = useRef(true);
  const lastHandledTxRef = useRef<`0x${string}` | null>(null);
  const scoreSubmittedRef = useRef(false);

  const [score, setScore] = useState(0);
  const [hearts, setHearts] = useState(HEARTS_TOTAL);
  const [level, setLevel] = useState(1);
  const [groundHits, setGroundHits] = useState(0);
  const [coinsCollected, setCoinsCollected] = useState(0);
  const [bank, setBank] = useState(0);
  const [lastRunScore, setLastRunScore] = useState(0);
  const [lastRunCoins, setLastRunCoins] = useState(0);
  const [running, setRunning] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [upgrades, setUpgrades] = useState<UpgradeState>(DEFAULT_UPGRADES);
  const [musicEnabled, setMusicEnabled] = useState(() => {
    if (typeof window === "undefined") return true;
    try {
      const stored = window.localStorage.getItem("memeblast-music");
      return stored === null ? true : stored === "true";
    } catch {
      return true;
    }
  });
  const [sfxEnabled, setSfxEnabled] = useState(() => {
    if (typeof window === "undefined") return true;
    try {
      const stored = window.localStorage.getItem("memeblast-sfx");
      return stored === null ? true : stored === "true";
    } catch {
      return true;
    }
  });
  const [pendingAction, setPendingAction] = useState<"start" | "playAgain" | null>(null);

  const { address, chain, isConnected } = useAccount();
  const publicClient = usePublicClient({ chainId: base.id });
  const { addScore } = useScoring();
  const {
    data: playFee,
    isLoading: playFeeLoading,
    isError: playFeeError,
  } = useReadContract({
    address: CONTRACT_ADDRESSES.memeblastFees as `0x${string}`,
    abi: MEMEBLAST_FEES_ABI,
    functionName: "playFee",
  });
  const {
    writeContract,
    data: feeTxHash,
    isPending: feeTxPending,
    error: feeTxError,
  } = useWriteContract();
  const { isSuccess: feeTxSuccess } = useWaitForTransactionReceipt({
    hash: feeTxHash,
  });

  const playFeeValue = typeof playFee === "bigint" ? playFee : null;
  const feeReady = playFeeValue !== null;
  const requiresPayment = feeReady && playFeeValue > BigInt(0);
  const playFeeLabel = playFeeValue ? formatEther(playFeeValue) : "0";
  const wrongNetwork = isConnected && !!chain && chain.id !== base.id;

  const enemySpritesRef = useRef<HTMLImageElement[]>([]);
  const enemySpriteSetsRef = useRef<Record<number, HTMLImageElement[]>>({});
  const enemySpriteLevelsRef = useRef<number[]>([]);
  const bossSpriteRef = useRef<HTMLImageElement | null>(null);
  const coinSpriteRef = useRef<HTMLImageElement | null>(null);
  const heartSpriteRef = useRef<HTMLImageElement | null>(null);
  const playerSpriteRef = useRef<HTMLImageElement | null>(null);
  const upgradesRef = useRef(upgrades);

  const inputRef = useRef({
    left: false,
    right: false,
    dragging: false,
    pointerX: 0,
  });

  const gameRef = useRef<GameState>({
    player: { x: 0, y: 0, width: 60, height: 60, speed: BASE_PLAYER_SPEED },
    bullets: [],
    enemies: [],
    coins: [],
    heartsPickups: [],
    coinsCollected: 0,
    enemyShots: [],
    boss: null,
    bossSpawned: false,
    bossDefeated: false,
    running: false,
    gameOver: false,
    score: 0,
    hearts: HEARTS_TOTAL,
    level: 1,
    groundHits: 0,
    spawnTimer: 0,
    lastShotAt: 0,
    lastFrameAt: 0,
  });

  useEffect(() => {
    const storedUpgrades = localStorage.getItem(STORAGE_KEYS.upgrades);
    const storedBank = localStorage.getItem(STORAGE_KEYS.bank);
    if (storedUpgrades) {
      try {
        const parsed = JSON.parse(storedUpgrades) as UpgradeState;
        setUpgrades({ ...DEFAULT_UPGRADES, ...parsed });
      } catch {
        // ignore
      }
    }
    if (storedBank) {
      const value = parseInt(storedBank, 10);
      if (!Number.isNaN(value)) setBank(value);
    }
  }, []);

  useEffect(() => {
    upgradesRef.current = upgrades;
    localStorage.setItem(STORAGE_KEYS.upgrades, JSON.stringify(upgrades));
  }, [upgrades]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.bank, String(bank));
  }, [bank]);

  useEffect(() => {
    musicEnabledRef.current = musicEnabled;
    localStorage.setItem("memeblast-music", String(musicEnabled));
  }, [musicEnabled]);

  useEffect(() => {
    sfxEnabledRef.current = sfxEnabled;
    localStorage.setItem("memeblast-sfx", String(sfxEnabled));
  }, [sfxEnabled]);

  useEffect(() => {
    if (!pendingAction || !feeTxSuccess || !feeTxHash) return;
    if (lastHandledTxRef.current === feeTxHash) return;
    lastHandledTxRef.current = feeTxHash;
    startGame();
    setPendingAction(null);
  }, [pendingAction, feeTxSuccess, feeTxHash]);

  useEffect(() => {
    if (!pendingAction || !feeTxError) return;
    const message = feeTxError instanceof Error ? feeTxError.message : "Transaction failed";
    alert(message);
    setPendingAction(null);
  }, [pendingAction, feeTxError]);

  useEffect(() => {
    let mounted = true;

    const loadImage = (src: string) =>
      new Promise<HTMLImageElement | null>((resolve) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => resolve(null);
        img.src = src;
      });

    const loadSprites = async () => {
      let urls = DEFAULT_ENEMY_IMAGES;
      try {
        const response = await fetch(ENEMY_MANIFEST_URL);
        if (response.ok) {
          const json = await response.json();
          if (Array.isArray(json?.images) && json.images.length) {
            urls = json.images;
          }
        }
      } catch {
        // ignore
      }

      const sprites = (await Promise.all(urls.map(loadImage))).filter(Boolean) as HTMLImageElement[];
      if (mounted) {
        enemySpritesRef.current = sprites;
        const levelSets: Record<number, HTMLImageElement[]> = {};
        const levelList: number[] = [];
        let bossSprite: HTMLImageElement | null = null;

        sprites.forEach((sprite) => {
          const path = new URL(sprite.src).pathname;
          if (/boss/i.test(path)) {
            bossSprite = sprite;
          }
          const match = path.match(/(?:enemy|object)-(\d+)\.png/i);
          if (match) {
            const level = parseInt(match[1], 10);
            if (!Number.isNaN(level)) {
              if (!levelSets[level]) {
                levelSets[level] = [];
                levelList.push(level);
              }
              levelSets[level].push(sprite);
            }
          }
        });

        levelList.sort((a, b) => a - b);
        enemySpriteSetsRef.current = levelSets;
        enemySpriteLevelsRef.current = levelList;
        bossSpriteRef.current = bossSprite ?? levelSets[BOSS_LEVEL]?.[0] ?? sprites[0] ?? null;
      }

      const playerSprite = (await loadImage(PLAYER_IMAGE)) ?? (await loadImage("/logo.png"));
      const coinSprite = (await loadImage(COIN_IMAGE)) ?? null;
      const heartSprite = (await loadImage(HEART_IMAGE)) ?? null;
      if (mounted) {
        playerSpriteRef.current = playerSprite;
        coinSpriteRef.current = coinSprite;
        heartSpriteRef.current = heartSprite;
      }
    };

    loadSprites();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const shotSounds = Array.from({ length: 4 }, () => {
      const audio = new Audio(SHOT_SOUND);
      audio.preload = "auto";
      audio.volume = 0.35;
      return audio;
    });
    const coinSounds = Array.from({ length: 4 }, () => {
      const audio = new Audio(COIN_SOUND);
      audio.preload = "auto";
      audio.volume = 0.4;
      return audio;
    });
    const hitSounds = Array.from({ length: 3 }, () => {
      const audio = new Audio(HIT_SOUND);
      audio.preload = "auto";
      audio.volume = 0.5;
      return audio;
    });
    const bossShootSounds = Array.from({ length: 2 }, () => {
      const audio = new Audio(BOSS_SHOOT_SOUND);
      audio.preload = "auto";
      audio.volume = 0.45;
      return audio;
    });
    const playerHitSounds = Array.from({ length: 3 }, () => {
      const audio = new Audio(PLAYER_HIT_SOUND);
      audio.preload = "auto";
      audio.volume = 0.55;
      return audio;
    });
    const healthPickup = new Audio(HEALTH_PICKUP_SOUND);
    healthPickup.preload = "auto";
    healthPickup.volume = 0.45;
    const bossLaugh = new Audio(BOSS_LAUGH_SOUND);
    bossLaugh.preload = "auto";
    bossLaugh.volume = 0.6;
    const music = new Audio(BACKGROUND_MUSIC);
    music.preload = "auto";
    music.loop = true;
    music.volume = 0.25;
    shotSoundsRef.current = shotSounds;
    coinSoundsRef.current = coinSounds;
    hitSoundsRef.current = hitSounds;
    bossLaughSoundRef.current = bossLaugh;
    bossShootSoundsRef.current = bossShootSounds;
    playerHitSoundsRef.current = playerHitSounds;
    healthPickupSoundRef.current = healthPickup;
    backgroundMusicRef.current = music;
  }, []);

  useEffect(() => {
    const music = backgroundMusicRef.current;
    if (!music) return;
    if (musicEnabled) {
      void music.play().catch(() => {});
    } else {
      music.pause();
      music.currentTime = 0;
    }
  }, [musicEnabled]);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const resize = (width: number, height: number) => {
      const dpr = window.devicePixelRatio || 1;
      sizeRef.current = { width, height, dpr };
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
    };

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      resize(entry.contentRect.width, entry.contentRect.height);
    });

    observer.observe(container);
    resize(container.clientWidth, container.clientHeight);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft" || event.key.toLowerCase() === "a") {
        inputRef.current.left = true;
        event.preventDefault();
      }
      if (event.key === "ArrowRight" || event.key.toLowerCase() === "d") {
        inputRef.current.right = true;
        event.preventDefault();
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft" || event.key.toLowerCase() === "a") {
        inputRef.current.left = false;
        event.preventDefault();
      }
      if (event.key === "ArrowRight" || event.key.toLowerCase() === "d") {
        inputRef.current.right = false;
        event.preventDefault();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  useEffect(() => {
    let animationFrame = 0;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const uiRef = { score: 0, hearts: HEARTS_TOTAL, level: 1, groundHits: 0, coins: 0, running: false, gameOver: false };

    const rectsOverlap = (a: { x: number; y: number; width: number; height: number }, b: { x: number; y: number; width: number; height: number }) =>
      a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;

    const getSpritesForLevel = (gameLevel: number) => {
      const levels = enemySpriteLevelsRef.current;
      const sets = enemySpriteSetsRef.current;
      if (levels.length === 0) return enemySpritesRef.current;
      const levelIndex = (gameLevel - 1) % levels.length;
      const levelKey = levels[levelIndex];
      return sets[levelKey] ?? enemySpritesRef.current;
    };

    const spawnCoins = (game: GameState, count: number, x: number, y: number) => {
      if (count <= 0) return;
      const size = 38;
      for (let i = 0; i < count; i += 1) {
        game.coins.push({
          x: x + randomBetween(-12, 12),
          y,
          width: size,
          height: size,
          vy: randomBetween(-140, -80),
          settled: false,
        });
      }
    };

    const spawnHeart = (game: GameState, x: number, y: number) => {
      const size = 34;
      game.heartsPickups.push({
        x: x + randomBetween(-8, 8),
        y,
        width: size,
        height: size,
        vy: randomBetween(-120, -60),
      });
    };

    const spawnEnemy = (game: GameState) => {
      const { width } = sizeRef.current;
      const size = randomBetween(Math.max(26, width * 0.06), Math.max(40, width * 0.12));
      const x = randomBetween(10, Math.max(12, width - size - 10));
      const level = game.level;
      const health = getEnemyHealth(level);
      const spriteSet = getSpritesForLevel(level);
      const sprite = spriteSet.length ? randomPick(spriteSet) : null;
      const roll = Math.random();
      let coinDrop = 0;
      if (roll < 0.1) coinDrop = 3;
      else if (roll < 0.25) coinDrop = 2;
      else if (roll < 0.5) coinDrop = 1;
      const heartDrop = Math.random() < 0.12;
      game.enemies.push({
        x,
        y: -size,
        width: size,
        height: size,
        speed: getEnemySpeed(level) + randomBetween(-30, 40),
        health,
        points: 10 + health * 5,
        sprite,
        coinDrop,
        heartDrop,
        tint: randomPick(colorPalette),
      });
    };

    const spawnBoss = (game: GameState) => {
      const { width } = sizeRef.current;
      const size = clamp(width * 0.22, 90, 140);
      game.boss = {
        x: width / 2 - size / 2,
        y: 70,
        width: size,
        height: size,
        health: BOSS_BASE_HEALTH + Math.floor(game.level / 2),
        maxHealth: BOSS_BASE_HEALTH + Math.floor(game.level / 2),
        speedY: 80,
        direction: 1,
        lastShotAt: 0,
        shotInterval: BOSS_SHOT_INTERVAL_MS,
        sprite: bossSpriteRef.current,
      };
      game.bossSpawned = true;
      game.bossDefeated = false;
    };

    const playShotSound = () => {
      if (!sfxEnabledRef.current) return;
      const sounds = shotSoundsRef.current;
      if (!sounds.length) return;
      const sound = sounds[shotSoundIndexRef.current % sounds.length];
      shotSoundIndexRef.current += 1;
      try {
        sound.currentTime = 0;
        void sound.play();
      } catch {
        // ignore autoplay restrictions
      }
    };

    const playCoinSound = () => {
      if (!sfxEnabledRef.current) return;
      const sounds = coinSoundsRef.current;
      if (!sounds.length) return;
      const sound = sounds[coinSoundIndexRef.current % sounds.length];
      coinSoundIndexRef.current += 1;
      try {
        sound.currentTime = 0;
        void sound.play();
      } catch {
        // ignore autoplay restrictions
      }
    };

    const playHitSound = () => {
      if (!sfxEnabledRef.current) return;
      const sounds = hitSoundsRef.current;
      if (!sounds.length) return;
      const sound = sounds[hitSoundIndexRef.current % sounds.length];
      hitSoundIndexRef.current += 1;
      try {
        sound.currentTime = 0;
        void sound.play();
      } catch {
        // ignore autoplay restrictions
      }
    };

    const playBossLaugh = () => {
      if (!sfxEnabledRef.current) return;
      const sound = bossLaughSoundRef.current;
      if (!sound) return;
      try {
        sound.currentTime = 0;
        void sound.play();
      } catch {
        // ignore autoplay restrictions
      }
    };

    const playBossShootSound = () => {
      if (!sfxEnabledRef.current) return;
      const sounds = bossShootSoundsRef.current;
      if (!sounds.length) return;
      const sound = sounds[bossShootSoundIndexRef.current % sounds.length];
      bossShootSoundIndexRef.current += 1;
      try {
        sound.currentTime = 0;
        void sound.play();
      } catch {
        // ignore autoplay restrictions
      }
    };

    const playPlayerHitSound = () => {
      if (!sfxEnabledRef.current) return;
      const sounds = playerHitSoundsRef.current;
      if (!sounds.length) return;
      const sound = sounds[playerHitSoundIndexRef.current % sounds.length];
      playerHitSoundIndexRef.current += 1;
      try {
        sound.currentTime = 0;
        void sound.play();
      } catch {
        // ignore autoplay restrictions
      }
    };

    const playHealthPickupSound = () => {
      if (!sfxEnabledRef.current) return;
      const sound = healthPickupSoundRef.current;
      if (!sound) return;
      try {
        sound.currentTime = 0;
        void sound.play();
      } catch {
        // ignore autoplay restrictions
      }
    };

    const spawnBullets = (game: GameState, now: number) => {
      const upgradeState = upgradesRef.current;
      const fireInterval = getFireInterval(upgradeState.fireRate);
      if (now - game.lastShotAt < fireInterval) return;
      game.lastShotAt = now;
      playShotSound();

      const shotCount = getShotCount(upgradeState.multiShot);
      const bulletSpeed = getBulletSpeed(upgradeState.bulletSpeed);
      const damage = getDamage(upgradeState.damage);
      const bulletWidth = 6;
      const bulletHeight = 16;
      const spread = shotCount > 1 ? 18 * (shotCount - 1) : 0;
      const centerX = game.player.x + game.player.width / 2 - bulletWidth / 2;

      for (let i = 0; i < shotCount; i += 1) {
        const offset = shotCount === 1 ? 0 : -spread / 2 + (spread / (shotCount - 1)) * i;
        game.bullets.push({
          x: centerX + offset,
          y: game.player.y - bulletHeight - 4,
          width: bulletWidth,
          height: bulletHeight,
          speed: bulletSpeed,
          damage,
        });
      }
    };

    const endGame = (game: GameState) => {
      game.running = false;
      game.gameOver = true;
      setRunning(false);
      setGameOver(true);
      setLastRunScore(game.score);
      setLastRunCoins(game.coinsCollected);
      if (!scoreSubmittedRef.current && address) {
        scoreSubmittedRef.current = true;
        void addScore("game", address, game.score).catch((error) => {
          console.error("Failed to record game score:", error);
          scoreSubmittedRef.current = false;
        });
      }
    };

    const update = (game: GameState, delta: number, now: number) => {
      const { width, height } = sizeRef.current;
      if (width === 0 || height === 0) return;
      const groundY = height - 18;

      const input = inputRef.current;
      if (input.dragging) {
        game.player.x = clamp(input.pointerX - game.player.width / 2, 0, width - game.player.width);
      } else {
        const direction = (input.right ? 1 : 0) - (input.left ? 1 : 0);
        game.player.x = clamp(game.player.x + direction * game.player.speed * delta, 0, width - game.player.width);
      }

      game.spawnTimer += delta;
      const spawnInterval = getSpawnInterval(game.level);
      while (game.spawnTimer >= spawnInterval) {
        spawnEnemy(game);
        game.spawnTimer -= spawnInterval;
      }

      if (game.level >= BOSS_LEVEL && !game.bossSpawned) {
        spawnBoss(game);
        playBossLaugh();
      }

      spawnBullets(game, now);

      for (let i = game.bullets.length - 1; i >= 0; i -= 1) {
        const bullet = game.bullets[i];
        bullet.y -= bullet.speed * delta;
        if (bullet.y + bullet.height < 0) {
          game.bullets.splice(i, 1);
        }
      }

      for (let i = game.coins.length - 1; i >= 0; i -= 1) {
        const coin = game.coins[i];
        if (!coin.settled) {
          coin.vy += COIN_GRAVITY * delta;
          coin.y += coin.vy * delta;
          if (coin.y + coin.height >= groundY) {
            coin.y = groundY - coin.height;
            if (Math.abs(coin.vy) <= COIN_SETTLE_SPEED) {
              coin.vy = 0;
              coin.settled = true;
            } else {
              coin.vy = -coin.vy * COIN_BOUNCE;
            }
          }
        }

        if (rectsOverlap(coin, game.player)) {
          game.coins.splice(i, 1);
          game.coinsCollected += 1;
          setBank((prev) => prev + 1);
          playCoinSound();
        }
      }

      for (let i = game.heartsPickups.length - 1; i >= 0; i -= 1) {
        const heart = game.heartsPickups[i];
        heart.vy += HEART_GRAVITY * delta;
        heart.y += heart.vy * delta;
        if (heart.y > height + 40) {
          game.heartsPickups.splice(i, 1);
          continue;
        }
        if (rectsOverlap(heart, game.player)) {
          game.heartsPickups.splice(i, 1);
          game.hearts = Math.min(HEARTS_TOTAL, game.hearts + 1);
          playHealthPickupSound();
        }
      }

      if (game.boss) {
        const boss = game.boss;
        const topBound = 40;
        const bottomBound = Math.min(200, height * 0.3);
        boss.y += boss.speedY * boss.direction * delta;
        if (boss.y <= topBound) {
          boss.y = topBound;
          boss.direction = 1;
        }
        if (boss.y + boss.height >= bottomBound) {
          boss.y = bottomBound - boss.height;
          boss.direction = -1;
        }

        if (now - boss.lastShotAt >= boss.shotInterval) {
          boss.lastShotAt = now;
          const playerCenterX = game.player.x + game.player.width / 2;
          const playerCenterY = game.player.y + game.player.height / 2;
          const bossCenterX = boss.x + boss.width / 2;
          const bossCenterY = boss.y + boss.height / 2;
          const dx = playerCenterX - bossCenterX;
          const dy = playerCenterY - bossCenterY;
          const length = Math.hypot(dx, dy) || 1;
          game.enemyShots.push({
            x: bossCenterX - 4,
            y: bossCenterY - 4,
            width: 8,
            height: 8,
            vx: (dx / length) * BOSS_BULLET_SPEED,
            vy: (dy / length) * BOSS_BULLET_SPEED,
            damage: 1,
          });
          playBossShootSound();
        }
      }

      for (let i = game.enemyShots.length - 1; i >= 0; i -= 1) {
        const shot = game.enemyShots[i];
        shot.x += shot.vx * delta;
        shot.y += shot.vy * delta;
        if (shot.y > height + 40 || shot.x < -40 || shot.x > width + 40) {
          game.enemyShots.splice(i, 1);
          continue;
        }
        if (rectsOverlap(shot, game.player)) {
          game.enemyShots.splice(i, 1);
          game.hearts -= shot.damage;
          playPlayerHitSound();
          if (game.hearts <= 0) {
            endGame(game);
            return;
          }
        }
      }

      if (game.boss && rectsOverlap(game.boss, game.player)) {
        game.hearts -= 1;
        playPlayerHitSound();
        if (game.hearts <= 0) {
          endGame(game);
          return;
        }
      }

      if (game.boss) {
        for (let j = game.bullets.length - 1; j >= 0; j -= 1) {
          const bullet = game.bullets[j];
          if (rectsOverlap(game.boss, bullet)) {
            game.bullets.splice(j, 1);
            game.boss.health -= bullet.damage;
            playHitSound();
            if (game.boss.health <= 0) {
              game.score += 600;
              spawnCoins(game, 5, game.boss.x + game.boss.width / 2, game.boss.y + game.boss.height / 2);
              game.boss = null;
              game.bossDefeated = true;
            }
            break;
          }
        }
      }

      for (let i = game.enemies.length - 1; i >= 0; i -= 1) {
        const enemy = game.enemies[i];
        enemy.y += enemy.speed * delta;

        if (enemy.y > height + enemy.height) {
          game.enemies.splice(i, 1);
          game.groundHits += 1;
          if (game.groundHits >= MAX_GROUND_HITS) {
            endGame(game);
            return;
          }
          continue;
        }

        if (rectsOverlap(enemy, game.player)) {
          game.enemies.splice(i, 1);
          game.hearts -= 1;
          playPlayerHitSound();
          if (game.hearts <= 0) {
            endGame(game);
            return;
          }
          continue;
        }

        for (let j = game.bullets.length - 1; j >= 0; j -= 1) {
          const bullet = game.bullets[j];
          if (rectsOverlap(enemy, bullet)) {
            game.bullets.splice(j, 1);
            enemy.health -= bullet.damage;
            playHitSound();
            if (enemy.health <= 0) {
              game.enemies.splice(i, 1);
              game.score += enemy.points;
              if (enemy.coinDrop > 0) {
                spawnCoins(game, enemy.coinDrop, enemy.x + enemy.width / 2, enemy.y + enemy.height / 2);
              }
              if (enemy.heartDrop) {
                spawnHeart(game, enemy.x + enemy.width / 2, enemy.y + enemy.height / 2);
              }
              const nextLevel = 1 + Math.floor(game.score / 250);
              if (nextLevel !== game.level) {
                game.level = nextLevel;
                game.groundHits = 0;
              }
          }
          break;
        }
      }
      }
    };

    const draw = (game: GameState) => {
      const { width, height, dpr } = sizeRef.current;
      if (width === 0 || height === 0) return;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);

      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, "rgba(15, 23, 42, 0.95)");
      gradient.addColorStop(1, "rgba(2, 6, 23, 0.95)");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = "rgba(148, 163, 184, 0.12)";
      ctx.fillRect(0, height - 18, width, 18);

      ctx.shadowColor = "rgba(99, 102, 241, 0.35)";
      ctx.shadowBlur = 12;
      ctx.fillStyle = "rgba(139, 92, 246, 0.9)";
      game.bullets.forEach((bullet) => {
        ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
      });
      ctx.shadowBlur = 0;

      const coinSprite = coinSpriteRef.current;
      game.coins.forEach((coin) => {
        if (coinSprite) {
          ctx.drawImage(coinSprite, coin.x, coin.y, coin.width, coin.height);
        } else {
          ctx.fillStyle = "rgba(234, 179, 8, 0.9)";
          ctx.beginPath();
          ctx.arc(coin.x + coin.width / 2, coin.y + coin.height / 2, coin.width / 2, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      const heartSprite = heartSpriteRef.current;
      game.heartsPickups.forEach((heart) => {
        if (heartSprite) {
          ctx.drawImage(heartSprite, heart.x, heart.y, heart.width, heart.height);
        } else {
          ctx.fillStyle = "rgba(248, 113, 113, 0.9)";
          ctx.beginPath();
          ctx.arc(heart.x + heart.width / 2, heart.y + heart.height / 2, heart.width / 2, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      ctx.fillStyle = "rgba(248, 250, 252, 0.8)";
      game.enemyShots.forEach((shot) => {
        ctx.beginPath();
        ctx.arc(shot.x + shot.width / 2, shot.y + shot.height / 2, shot.width / 2, 0, Math.PI * 2);
        ctx.fill();
      });

      if (game.boss) {
        const bossSprite = game.boss.sprite;
        if (bossSprite) {
          ctx.drawImage(bossSprite, game.boss.x, game.boss.y, game.boss.width, game.boss.height);
        } else {
          ctx.fillStyle = "rgba(244, 63, 94, 0.85)";
          ctx.beginPath();
          ctx.arc(game.boss.x + game.boss.width / 2, game.boss.y + game.boss.height / 2, game.boss.width / 2, 0, Math.PI * 2);
          ctx.fill();
        }

        const barWidth = game.boss.width;
        const barHeight = 6;
        const barX = game.boss.x;
        const barY = game.boss.y - 10;
        ctx.fillStyle = "rgba(15, 23, 42, 0.8)";
        ctx.fillRect(barX, barY, barWidth, barHeight);
        ctx.fillStyle = "rgba(248, 113, 113, 0.9)";
        ctx.fillRect(barX, barY, (game.boss.health / game.boss.maxHealth) * barWidth, barHeight);
      }

      game.enemies.forEach((enemy) => {
        if (enemy.sprite) {
          ctx.drawImage(enemy.sprite, enemy.x, enemy.y, enemy.width, enemy.height);
        } else {
          ctx.fillStyle = enemy.tint;
          ctx.beginPath();
          ctx.arc(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, enemy.width / 2, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      const playerSprite = playerSpriteRef.current;
      if (playerSprite) {
        ctx.drawImage(playerSprite, game.player.x, game.player.y, game.player.width, game.player.height);
      } else {
        ctx.fillStyle = "rgba(14, 165, 233, 0.9)";
        ctx.beginPath();
        ctx.arc(game.player.x + game.player.width / 2, game.player.y + game.player.height / 2, game.player.width / 2, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const frame = (now: number) => {
      const game = gameRef.current;
      const delta = game.lastFrameAt ? (now - game.lastFrameAt) / 1000 : 0;
      game.lastFrameAt = now;

      if (game.running) {
        update(game, delta, now);
      }

      draw(game);

      if (uiRef.score !== game.score) {
        uiRef.score = game.score;
        setScore(game.score);
      }
      if (uiRef.hearts !== game.hearts) {
        uiRef.hearts = game.hearts;
        setHearts(game.hearts);
      }
      if (uiRef.level !== game.level) {
        uiRef.level = game.level;
        setLevel(game.level);
      }
      if (uiRef.groundHits !== game.groundHits) {
        uiRef.groundHits = game.groundHits;
        setGroundHits(game.groundHits);
      }
      if (uiRef.coins !== game.coinsCollected) {
        uiRef.coins = game.coinsCollected;
        setCoinsCollected(game.coinsCollected);
      }
      if (uiRef.running !== game.running) {
        uiRef.running = game.running;
        setRunning(game.running);
      }
      if (uiRef.gameOver !== game.gameOver) {
        uiRef.gameOver = game.gameOver;
        setGameOver(game.gameOver);
      }

      animationFrame = requestAnimationFrame(frame);
    };

    animationFrame = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(animationFrame);
  }, []);

  const startGame = () => {
    const music = backgroundMusicRef.current;
    if (music && musicEnabledRef.current) {
      void music.play().catch(() => {});
    }
    const game = gameRef.current;
    const { width, height } = sizeRef.current;
    const playerSize = clamp(width * 0.12, 52, 82);
    game.player = {
      x: width / 2 - playerSize / 2,
      y: height - playerSize - 30,
      width: playerSize,
      height: playerSize,
      speed: BASE_PLAYER_SPEED,
    };
    game.bullets = [];
    game.enemies = [];
    game.coins = [];
    game.heartsPickups = [];
    game.coinsCollected = 0;
    game.enemyShots = [];
    game.boss = null;
    game.bossSpawned = false;
    game.bossDefeated = false;
    game.running = true;
    game.gameOver = false;
    game.score = 0;
    game.hearts = HEARTS_TOTAL;
    game.level = 1;
    game.groundHits = 0;
    game.spawnTimer = 0;
    game.lastShotAt = 0;
    game.lastFrameAt = 0;

    setScore(0);
    setHearts(HEARTS_TOTAL);
    setLevel(1);
    setGroundHits(0);
    setCoinsCollected(0);
    setRunning(true);
    setGameOver(false);
    scoreSubmittedRef.current = false;
  };

  const requestGameStart = async (action: "start" | "playAgain") => {
    if (pendingAction || feeTxPending) return;
    if (playFeeLoading || playFeeError) return;
    const feeValue = playFeeValue ?? BigInt(0);
    if (!isConnected || !address) {
      alert("Please connect your wallet first");
      return;
    }
    if (!chain || chain.id !== base.id) {
      alert("Wrong network! Please switch to Base Mainnet in your wallet.");
      return;
    }
    if (!publicClient) {
      alert("Wallet client not ready. Please try again.");
      return;
    }
    setPendingAction(action);
    try {
      const gasEstimate = await publicClient.estimateContractGas({
        address: CONTRACT_ADDRESSES.memeblastFees as `0x${string}`,
        abi: MEMEBLAST_FEES_ABI,
        functionName: action === "start" ? "startGame" : "playAgain",
        value: feeValue,
        account: address,
      });
      const gasLimit = gasEstimate + BigInt(5000);
      writeContract({
        address: CONTRACT_ADDRESSES.memeblastFees as `0x${string}`,
        abi: MEMEBLAST_FEES_ABI,
        functionName: action === "start" ? "startGame" : "playAgain",
        value: feeValue,
        account: address,
        chain: base,
        gas: gasLimit,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Transaction failed";
      alert(message);
      setPendingAction(null);
    }
  };

  const buyUpgrade = (key: UpgradeKey) => {
    const currentLevel = upgrades[key];
    const maxLevel = MAX_UPGRADES[key];
    if (currentLevel >= maxLevel) return;
    const cost = getUpgradeCost(key, currentLevel);
    if (bank < cost) return;
    setBank((prev) => prev - cost);
    setUpgrades((prev) => ({ ...prev, [key]: prev[key] + 1 }));
  };

  const upgradeCards = useMemo(
    () =>
      (Object.keys(UPGRADE_CONFIG) as UpgradeKey[]).map((key) => {
        const config = UPGRADE_CONFIG[key];
        const levelValue = upgrades[key];
        const cost = getUpgradeCost(key, levelValue);
        const maxed = levelValue >= MAX_UPGRADES[key];
        const affordable = bank >= cost;
        return {
          key,
          label: config.label,
          description: config.description,
          level: levelValue,
          cost,
          maxed,
          affordable,
        };
      }),
    [upgrades, bank]
  );

  const handlePointerDown = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const music = backgroundMusicRef.current;
    if (music && musicEnabledRef.current) {
      void music.play().catch(() => {});
    }
    const rect = event.currentTarget.getBoundingClientRect();
    inputRef.current.dragging = true;
    inputRef.current.pointerX = event.clientX - rect.left;
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!inputRef.current.dragging) return;
    const rect = event.currentTarget.getBoundingClientRect();
    inputRef.current.pointerX = event.clientX - rect.left;
  };

  const handlePointerUp = () => {
    inputRef.current.dragging = false;
  };

  const handleBack = () => {
    const music = backgroundMusicRef.current;
    if (music) {
      music.pause();
      music.currentTime = 0;
    }
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
      return;
    }
    router.push("/");
  };

  const handleRecast = async () => {
    const origin =
      typeof window !== "undefined"
        ? window.location.origin
        : "https://mememint-one.vercel.app";
    const url = `${origin}/memeblast`;
    try {
      await sdk.actions.composeCast({
        text: `I scored ${lastRunScore} in MemeBlast! 💥`,
        embeds: [url],
      });
    } catch (error) {
      console.error("Failed to share MemeBlast score:", error);
    }
  };

  useEffect(() => {
    return () => {
      const music = backgroundMusicRef.current;
      if (music) {
        music.pause();
        music.currentTime = 0;
      }
    };
  }, []);

  return (
    <div className="h-[100svh] w-full px-3 sm:px-4 md:px-6 py-3 sm:py-4 md:py-8 overflow-hidden">
      <div className="max-w-5xl mx-auto flex flex-col h-full">
        <div className="text-center mb-4 md:mb-6 shrink-0">
          <h1 className="text-lg md:text-xl font-extrabold tracking-tight">MemeBlast</h1>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-3">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleBack}
              className="px-3 py-1.5 rounded-full text-xs font-semibold"
              style={{ background: "var(--mm-surface)" }}
            >
              ← Back
            </button>
            <button
              type="button"
              onClick={() => setSfxEnabled((prev) => !prev)}
              className="px-3 py-1.5 rounded-full text-[11px] font-semibold"
              style={{ background: "var(--mm-surface)" }}
            >
              {sfxEnabled ? "🔊 SFX" : "🔇 SFX"}
            </button>
            <button
              type="button"
              onClick={() => setMusicEnabled((prev) => !prev)}
              className="px-3 py-1.5 rounded-full text-[11px] font-semibold"
              style={{ background: "var(--mm-surface)" }}
            >
              {musicEnabled ? "🔊 Music" : "🔇 Music"}
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <div className="px-3 py-1.5 rounded-full font-semibold" style={{ background: "var(--mm-surface)" }}>
              Score: <span className="font-bold">{score}</span>
            </div>
            <div className="px-3 py-1.5 rounded-full font-semibold flex items-center gap-2" style={{ background: "var(--mm-surface)" }}>
              <img src={COIN_IMAGE} alt="Coin" className="w-6 h-6" />
              <span className="font-bold">{bank}</span>
            </div>
            <div className="px-3 py-1.5 rounded-full font-semibold" style={{ background: "var(--mm-surface)" }}>
              Level: <span className="font-bold">{level}</span>
            </div>
            <div className="px-3 py-1.5 rounded-full font-semibold" style={{ background: "var(--mm-surface)" }}>
              Missed: <span className="font-bold">{groundHits}/{MAX_GROUND_HITS}</span>
            </div>
            <div className="px-3 py-1.5 rounded-full font-semibold" style={{ background: "var(--mm-surface)" }}>
              {"❤️".repeat(Math.max(0, hearts))} <span className="ml-1">({hearts}/{HEARTS_TOTAL})</span>
            </div>
          </div>
        </div>

        <div
          ref={containerRef}
          className="relative w-full flex-1 min-h-0 max-h-[720px] rounded-3xl overflow-hidden border"
          style={{ borderColor: "var(--mm-border)", background: "color-mix(in oklab, var(--mm-surface) 85%, transparent)" }}
        >
          <canvas
            ref={canvasRef}
            className="w-full h-full touch-none"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
          />

          {!running && !gameOver && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm p-3">
              <div className="mm-card mm-card-strong max-w-sm w-full p-4 sm:p-5 text-center space-y-3">
                <h2 className="text-xl font-bold">Ready to dodge?</h2>
                <p className="text-xs sm:text-sm" style={{ color: "var(--mm-muted)" }}>
                  Auto-shooting is enabled. You have 5 hearts. Objects only hurt if they hit you.
                </p>
                <p className="text-xs sm:text-sm" style={{ color: "var(--mm-muted)" }}>
                  Drag to move on mobile, use ← → on desktop. Dodge the falling chaos.
                </p>
                {playFeeLoading && (
                  <p className="text-xs sm:text-sm" style={{ color: "var(--mm-muted)" }}>
                    Loading play fee...
                  </p>
                )}
                {playFeeError && (
                  <p className="text-xs sm:text-sm" style={{ color: "var(--mm-muted)" }}>
                    Unable to load play fee.
                  </p>
                )}
                {requiresPayment && !playFeeLoading && !playFeeError && (
                  <p className="text-xs sm:text-sm" style={{ color: "var(--mm-muted)" }}>
                    Play fee: <span className="font-semibold text-white">{playFeeLabel} ETH</span>
                  </p>
                )}
                {!isConnected && (
                  <div className="flex justify-center">
                    <WalletButton />
                  </div>
                )}
                {wrongNetwork && (
                  <p className="text-xs sm:text-sm" style={{ color: "var(--mm-muted)" }}>
                    Please switch to Base Mainnet.
                  </p>
                )}
                <button
                  type="button"
                  onClick={() => requestGameStart("start")}
                  disabled={
                    playFeeLoading ||
                    playFeeError ||
                    pendingAction !== null ||
                    feeTxPending ||
                    !isConnected ||
                    wrongNetwork
                  }
                  className="w-full py-2.5 rounded-xl font-semibold text-white"
                  style={{ background: "linear-gradient(135deg, var(--mm-accent), var(--mm-accent-2))" }}
                >
                  {pendingAction === "start"
                    ? "Starting..."
                    : `Start Game (${feeReady ? playFeeLabel : "0"} ETH)`}
                </button>
              </div>
            </div>
          )}

        </div>

        {gameOver && (
          <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 backdrop-blur-sm p-3">
            <div className="mm-card mm-card-strong w-full max-w-sm sm:max-w-md p-4 sm:p-5 space-y-3 max-h-[85svh] overflow-y-auto">
              <div className="text-center space-y-1.5">
                <h2 className="text-xl font-bold">Game Over</h2>
                <p className="text-xs sm:text-sm" style={{ color: "var(--mm-muted)" }}>
                  Run score: <span className="font-semibold text-white">{lastRunScore}</span> • Run coins:{" "}
                  <span className="font-semibold text-white">{lastRunCoins}</span> • Total coins:{" "}
                  <span className="font-semibold text-white">{bank}</span>
                </p>
                {playFeeLoading && (
                  <p className="text-xs sm:text-sm" style={{ color: "var(--mm-muted)" }}>
                    Loading play fee...
                  </p>
                )}
                {playFeeError && (
                  <p className="text-xs sm:text-sm" style={{ color: "var(--mm-muted)" }}>
                    Unable to load play fee.
                  </p>
                )}
                {requiresPayment && !playFeeLoading && !playFeeError && (
                  <p className="text-xs sm:text-sm" style={{ color: "var(--mm-muted)" }}>
                    Play fee: <span className="font-semibold text-white">{playFeeLabel} ETH</span>
                  </p>
                )}
                {!isConnected && (
                  <div className="flex justify-center">
                    <WalletButton />
                  </div>
                )}
                {wrongNetwork && (
                  <p className="text-xs sm:text-sm" style={{ color: "var(--mm-muted)" }}>
                    Please switch to Base Mainnet.
                  </p>
                )}
              </div>

              <div className="grid gap-2 sm:gap-3 md:grid-cols-2">
                {upgradeCards.map((upgrade) => (
                  <div key={upgrade.key} className="rounded-2xl border p-3" style={{ borderColor: "var(--mm-border)", background: "var(--mm-surface)" }}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-semibold">{upgrade.label}</span>
                      <span className="text-[10px]" style={{ color: "var(--mm-faint)" }}>
                        Lv {upgrade.level}/{MAX_UPGRADES[upgrade.key]}
                      </span>
                    </div>
                    <p className="text-[11px] mb-2" style={{ color: "var(--mm-muted)" }}>
                      {upgrade.description}
                    </p>
                    <button
                      type="button"
                      disabled={upgrade.maxed || !upgrade.affordable}
                      onClick={() => buyUpgrade(upgrade.key)}
                      className="w-full py-2 rounded-xl text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ background: "linear-gradient(135deg, var(--mm-accent), var(--mm-accent-2))", color: "white" }}
                    >
                      {upgrade.maxed ? "Maxed" : `Buy (${upgrade.cost} coins)`}
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex gap-3 flex-col sm:flex-row">
                <button
                  type="button"
                  onClick={handleRecast}
                  className="flex-1 py-2.5 rounded-xl font-semibold"
                  style={{ background: "var(--mm-surface)", color: "var(--mm-text)" }}
                >
                  🔁 Recast
                </button>
                <button
                  type="button"
                  onClick={() => requestGameStart("playAgain")}
                  disabled={
                    playFeeLoading ||
                    playFeeError ||
                    pendingAction !== null ||
                    feeTxPending ||
                    !isConnected ||
                    wrongNetwork
                  }
                  className="flex-1 py-2.5 rounded-xl font-semibold text-white"
                  style={{ background: "linear-gradient(135deg, var(--mm-accent), var(--mm-accent-2))" }}
                >
                  {pendingAction === "playAgain" ? "Restarting..." : "Play Again"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
