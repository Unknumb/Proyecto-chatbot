import { MLCEngineWorkerHandler, MCLEngine} from "https://esm.run/@mlc-ai/web-llm"

const engine = new MCLEngine()
const handler = new MLCEngineWorkerHandler(engine)

onmessage = msg => {
    handler.onmessage(msg)
}