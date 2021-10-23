const express = require('express')
const localtunnel = require('localtunnel')
const morgan = require('morgan')
const { exit } = require('yargs')
const yargs = require('yargs')
const argv = yargs
  .usage('Usage: $0 <service> [options]')
  .example('$0 service:8080 -p 4040')
  .demandCommand(1, 'Must enter service')
  .alias('p', 'port')
  .describe('p', 'Port to manage tunnel')
  .describe('host', 'URL for the upstream proxy server')
  .alias('h', 'help')
  .help('h')
  .argv
const [localhost, localport] = argv._[0].split(':')
const port = argv.port || 4040
const host = argv.host || 'https://localtunnel.me'

const app = express()

async function main () {
  const tunnel = await localtunnel({ port: localport, local_host: localhost, host: host })
  tunnel.on('request', (info) => { console.log(info) })
  tunnel.on('error', (err) => { console.error(err) })
  tunnel.on('close', () => { console.log('Closing tunnel') })

  app.use(morgan('tiny'))

  app.get(/^\/(?:url)?$/, async (req, res) => {
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
      mangement: port,
      status: tunnel === null ? 'stopped' : 'running',
      url: tunnel === null ? null : tunnel.url
    })
  })

  app.listen(port, () => {
    if (argv.host) {
      console.log(`Using tunnel server: ${host}`)
    }
    console.log(`Tunnel to ${localhost}:${localport} running; mangement available on ${port}`)
    console.log(`Tunnel URL is: ${tunnel.url}`)
  })
}

(async () => { await main() })().catch((err) => { console.error(err); exit(1) })
