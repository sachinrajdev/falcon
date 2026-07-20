import LlamaCloud from "@llamaindex/llama-cloud";

let _llama: LlamaCloud | null = null;

// Lazy singleton — constructing this at module-load time (the old pattern)
// throws immediately if LLAMA_CLOUD_API_KEY is missing, which happens during
// `next build`'s page-data collection step and fails the ENTIRE build, not
// just requests. Deferring construction to first actual use means a missing
// key only fails the specific request that needs it, with a clear error.
export function getLlama(): LlamaCloud {
  if (!_llama) {
    const apiKey = process.env.LLAMA_CLOUD_API_KEY;
    if (!apiKey) {
      throw new Error("LLAMA_CLOUD_API_KEY environment variable is not set.");
    }
    _llama = new LlamaCloud({ apiKey });
  }
  return _llama;
}