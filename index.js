const express = require('express')
const localtunnel = require('@security-patched/localtunnel')
const morgan = require('morgan')
const { exit } = require('yargs')
const yargs = require('yargs')
const DEFAULT_HOST = 'https://localtunnel.me'
const argv = yargs
  .scriptName('agent-tunnel')
  .usage('Usage: $0 <service> [options]')
  .example('$0 service:8080 -p 4040')
  .options({
    service: {
      alias: 's',
      type: 'string',
      describe: 'service to tunnel to',
      demandOption: 'Must define service'
    },
    port: {
      alias: 'p',
      default: 4040,
      type: 'number',
      describe: 'Port to manage tunnel'
    },
    host: {
      alias: 'h',
      default: DEFAULT_HOST,
      type: 'string',
      describe: 'URL for the upstream proxy server'
    }
  })
  .help('help')
  .argv
const [localhost, localport] = argv.service.split(':')

const app = express()

async function main () {
  const tunnel = await localtunnel({ port: localport, local_host: localhost, host: argv.host })
  tunnel.on('request', (info) => { console.log(info) })
  tunnel.on('error', (err) => { console.error(err) })
  tunnel.on('close', () => { console.log('Closing tunnel') })

  app.use(morgan('tiny'))

  app.get(/^\/(?:url|start)?$/, async (req, res) => {
    if (tunnel === null) {
      res.status(500).json({ error: 'tunnel failed to start' })
      return
    }
    res.json({ url: tunnel.url })
  })

  app.get('/status', async (req, res) => {
    res.json({
      host: localhost,
      port: localport,
      mangement: argv.port,
      status: tunnel === null ? 'stopped' : 'running',
      url: tunnel === null ? null : tunnel.url
    })
  })

  app.listen(argv.port, () => {
    if (argv.host !== DEFAULT_HOST) {
      console.log(`Using tunnel server: ${argv.host}`)
    }
    console.log(`Tunnel to ${localhost}:${localport} running; mangement available on ${argv.port}`)
    console.log(`Tunnel URL is: ${tunnel.url}`)
  })
}

(async () => { await main() })().catch((err) => { console.error(err); exit(1) })
