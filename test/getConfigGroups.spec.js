import { jest } from '@jest/globals'
import makeConsoleMock from 'consolemock'

jest.unstable_mockModule('../lib/loadConfig.js', () => ({
  // config not found
  loadConfig: jest.fn(async () => ({})),
}))

const { loadConfig } = await import('../lib/loadConfig.js')
const { getConfigGroups } = await import('../lib/getConfigGroups.js')

const globalConsoleTemp = console

const config = {
  '*.js': 'my-task',
}

describe('getConfigGroups', () => {
  beforeEach(() => {
    console = makeConsoleMock()
  })

  afterEach(() => {
    console.printHistory()
    console = globalConsoleTemp
  })

  it('should throw when config path not found', async () => {
    await expect(getConfigGroups({ configPath: '/' })).rejects.toThrowErrorMatchingInlineSnapshot(
      `"Configuration could not be found"`
    )
  })

  it('should find config files for all staged files', async () => {
    // Base cwd
    loadConfig.mockResolvedValueOnce({ config, filepath: '/.lintstagedrc.json' })
    // '/foo.js' and '/bar.js'
    loadConfig.mockResolvedValueOnce({ config, filepath: '/.lintstagedrc.json' })
    // '/deeper/foo.js'
    loadConfig.mockResolvedValueOnce({ config, filepath: '/deeper/.lintstagedrc.json' })
    // '/even/deeper/foo.js'
    loadConfig.mockResolvedValueOnce({ config, filepath: '/deeper/.lintstagedrc.json' })

    const configGroups = await getConfigGroups({
      files: ['/foo.js', '/bar.js', '/deeper/foo.js', '/even/deeper/foo.js'],
    })

    expect(configGroups).toEqual({
      '/.lintstagedrc.json': { config, files: ['/foo.js', '/bar.js'] },
      '/deeper/.lintstagedrc.json': { config, files: ['/deeper/foo.js', '/even/deeper/foo.js'] },
    })
  })

  it('should find config for one file, and not care about other', async () => {
    // Base cwd
    loadConfig.mockResolvedValueOnce({})
    // '/foo.js'
    loadConfig.mockResolvedValueOnce({})
    // '/deeper/foo.js'
    loadConfig.mockResolvedValueOnce({ config, filepath: '/deeper/.lintstagedrc.json' })

    const configGroups = await getConfigGroups({
      files: ['/foo.js', '/deeper/foo.js'],
    })

    expect(configGroups).toEqual({
      '/deeper/.lintstagedrc.json': { config, files: ['/deeper/foo.js'] },
    })
  })
})
