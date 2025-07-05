import { KaleidoClient } from "../src/client"

async function main() {
    const client = new KaleidoClient({
        baseUrl: 'http://localhost:8000/api/v1',
        nodeUrl: 'http://localhost:3001/'
    })

    const nodeInfo = await client.getNodeInfo()
    console.log(nodeInfo)
}

main().catch(console.error)