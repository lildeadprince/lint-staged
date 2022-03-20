import path from 'path'
import { fileURLToPath } from 'url'

import { jest } from '@jest/globals'
import makeConsoleMock from 'consolemock'

import { mockListr } from './utils/mockListr.js'

const { Listr } = await mockListr()

jest.unstable_mockModule('../lib/resolveGitRepo.js', () => ({
  resolveGitRepo: jest.fn(async () => ({ gitDir: 'foo', gitConfigDir: 'bar' })),
}))

const { default: lintStaged } = await import('../lib/index.js')

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

describe.skip('lintStaged', () => {
  afterEach(() => {
    Listr.mockClear()
  })

  it('should pass quiet flag to Listr', async () => {
    expect.assertions(1)
    await lintStaged(
      { configPath: path.join(__dirname, 'fixtures', 'my-config.json'), quiet: true },
      makeConsoleMock()
    )

    expect(Listr).toHaveBeenCalledTimes(1)

    expect(Listr.mock.calls[0][1]).toMatchInlineSnapshot(`
      Object {
        "ctx": Object {
          "errors": Set {},
          "hasPartiallyStagedFiles": null,
          "output": Array [],
          "quiet": true,
          "shouldBackup": true,
        },
        "exitOnError": false,
        "nonTTYRenderer": "silent",
        "registerSignalListeners": false,
        "renderer": "silent",
      }
    `)
  })

  it('should pass debug flag to Listr', async () => {
    expect.assertions(1)
    await lintStaged(
      {
        configPath: path.join(__dirname, 'fixtures', 'my-config.json'),
        debug: true,
      },
      makeConsoleMock()
    )
    expect(Listr.mock.calls[0][1]).toMatchInlineSnapshot(`
      Object {
        "ctx": Object {
          "errors": Set {},
          "hasPartiallyStagedFiles": null,
          "output": Array [],
          "quiet": false,
          "shouldBackup": true,
        },
        "exitOnError": false,
        "nonTTYRenderer": "verbose",
        "registerSignalListeners": false,
        "renderer": "verbose",
      }
    `)
  })

  it('should catch errors from js function config', async () => {
    const logger = makeConsoleMock()
    const config = {
      '*': () => {
        throw new Error('failed config')
      },
    }

    expect.assertions(2)
    await expect(lintStaged({ config }, logger)).rejects.toThrowErrorMatchingInlineSnapshot(
      `"failed config"`
    )

    expect(logger.printHistory()).toMatchInlineSnapshot(`""`)
  })
})
