import os from 'os'
import type { SystemInfo } from '@features/computer-infos/type'

const convertToGB = (bytes: number): string => {
  return (bytes / 1024 ** 3).toFixed(2)
}

const formatUptime = (seconds: number): string => {
  const days = Math.floor(seconds / 86400)
  const hours = Math.floor((seconds % 86400) / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)

  if (days > 0) return `${days}j ${hours}h ${minutes}m`
  if (hours > 0) return `${hours}h ${minutes}m`
  return `${minutes}m`
}

const getPlatformName = (platform: string): string => {
  const platforms: Record<string, string> = {
    win32: 'Windows',
    darwin: 'macOS',
    linux: 'Linux',
    freebsd: 'FreeBSD',
    openbsd: 'OpenBSD'
  }
  return platforms[platform] || platform
}

export const getSystemInfoService = (): SystemInfo => {
  const platform = getPlatformName(os.platform())
  const arch = os.arch()
  const cpus = os.cpus()
  const totalMemory = convertToGB(os.totalmem())
  const freeMemory = convertToGB(os.freemem())
  const usedMemory = convertToGB(os.totalmem() - os.freemem())
  const memoryUsage = (
    ((os.totalmem() - os.freemem()) / os.totalmem()) *
    100
  ).toFixed(1)
  const uptime = formatUptime(os.uptime())
  const nodeVersion = process.version

  const formattedInfo = `Informations Système

OS: ${platform} ${arch}
RAM: ${usedMemory}GB / ${totalMemory}GB (${memoryUsage}%)
RAM Libre: ${freeMemory}GB
Processeur: ${cpus[0]?.model || 'Inconnu'}
Cœurs: ${cpus.length}
Uptime: ${uptime}
Node.js: ${nodeVersion}`

  return {
    platform,
    arch,
    totalMemory,
    freeMemory,
    usedMemory,
    memoryUsage,
    processor: cpus[0]?.model || 'Inconnu',
    cores: cpus.length,
    uptime,
    nodeVersion,
    formatted: formattedInfo
  }
}

export const getSystemInfoEmbed = () => {
  const info = getSystemInfoService()

  return {
    color: 0x00ff00,
    title: 'Informations Système',
    fields: [
      {
        name: 'Système',
        value: `${info.platform} ${info.arch}`,
        inline: true
      },
      {
        name: 'Processeur',
        value: `${info.processor}\n${info.cores} cœurs`,
        inline: true
      },
      {
        name: 'RAM',
        value: `${info.usedMemory}GB / ${info.totalMemory}GB\n(${info.memoryUsage}% utilisée)`,
        inline: true
      },
      {
        name: 'Uptime',
        value: info.uptime,
        inline: true
      },
      {
        name: 'Node.js',
        value: info.nodeVersion,
        inline: true
      },
      {
        name: 'RAM Libre',
        value: `${info.freeMemory}GB`,
        inline: true
      }
    ],
    timestamp: new Date().toISOString()
  }
}

export const logSystemInfo = (): void => {
  const info = getSystemInfoService()
  console.log(info.formatted)
}
