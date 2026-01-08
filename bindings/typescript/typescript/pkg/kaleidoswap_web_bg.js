let wasm;
export function __wbg_set_wasm(val) {
    wasm = val;
}

function addToExternrefTable0(obj) {
    const idx = wasm.__externref_table_alloc();
    wasm.__wbindgen_externrefs.set(idx, obj);
    return idx;
}

function _assertClass(instance, klass) {
    if (!(instance instanceof klass)) {
        throw new Error(`expected instance of ${klass.name}`);
    }
}

const CLOSURE_DTORS = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(state => state.dtor(state.a, state.b));

function debugString(val) {
    // primitive types
    const type = typeof val;
    if (type == 'number' || type == 'boolean' || val == null) {
        return  `${val}`;
    }
    if (type == 'string') {
        return `"${val}"`;
    }
    if (type == 'symbol') {
        const description = val.description;
        if (description == null) {
            return 'Symbol';
        } else {
            return `Symbol(${description})`;
        }
    }
    if (type == 'function') {
        const name = val.name;
        if (typeof name == 'string' && name.length > 0) {
            return `Function(${name})`;
        } else {
            return 'Function';
        }
    }
    // objects
    if (Array.isArray(val)) {
        const length = val.length;
        let debug = '[';
        if (length > 0) {
            debug += debugString(val[0]);
        }
        for(let i = 1; i < length; i++) {
            debug += ', ' + debugString(val[i]);
        }
        debug += ']';
        return debug;
    }
    // Test for built-in
    const builtInMatches = /\[object ([^\]]+)\]/.exec(toString.call(val));
    let className;
    if (builtInMatches && builtInMatches.length > 1) {
        className = builtInMatches[1];
    } else {
        // Failed to match the standard '[object ClassName]'
        return toString.call(val);
    }
    if (className == 'Object') {
        // we're a user defined class or Object
        // JSON.stringify avoids problems with cycles, and is generally much
        // easier than looping through ownProperties of `val`.
        try {
            return 'Object(' + JSON.stringify(val) + ')';
        } catch (_) {
            return 'Object';
        }
    }
    // errors
    if (val instanceof Error) {
        return `${val.name}: ${val.message}\n${val.stack}`;
    }
    // TODO we could test for more things here, like `Set`s and `Map`s.
    return className;
}

function getArrayU8FromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return getUint8ArrayMemory0().subarray(ptr / 1, ptr / 1 + len);
}

let cachedDataViewMemory0 = null;
function getDataViewMemory0() {
    if (cachedDataViewMemory0 === null || cachedDataViewMemory0.buffer.detached === true || (cachedDataViewMemory0.buffer.detached === undefined && cachedDataViewMemory0.buffer !== wasm.memory.buffer)) {
        cachedDataViewMemory0 = new DataView(wasm.memory.buffer);
    }
    return cachedDataViewMemory0;
}

function getStringFromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return decodeText(ptr, len);
}

let cachedUint8ArrayMemory0 = null;
function getUint8ArrayMemory0() {
    if (cachedUint8ArrayMemory0 === null || cachedUint8ArrayMemory0.byteLength === 0) {
        cachedUint8ArrayMemory0 = new Uint8Array(wasm.memory.buffer);
    }
    return cachedUint8ArrayMemory0;
}

function handleError(f, args) {
    try {
        return f.apply(this, args);
    } catch (e) {
        const idx = addToExternrefTable0(e);
        wasm.__wbindgen_exn_store(idx);
    }
}

function isLikeNone(x) {
    return x === undefined || x === null;
}

function makeMutClosure(arg0, arg1, dtor, f) {
    const state = { a: arg0, b: arg1, cnt: 1, dtor };
    const real = (...args) => {

        // First up with a closure we increment the internal reference
        // count. This ensures that the Rust closure environment won't
        // be deallocated while we're invoking it.
        state.cnt++;
        const a = state.a;
        state.a = 0;
        try {
            return f(a, state.b, ...args);
        } finally {
            state.a = a;
            real._wbg_cb_unref();
        }
    };
    real._wbg_cb_unref = () => {
        if (--state.cnt === 0) {
            state.dtor(state.a, state.b);
            state.a = 0;
            CLOSURE_DTORS.unregister(state);
        }
    };
    CLOSURE_DTORS.register(real, state, state);
    return real;
}

function passStringToWasm0(arg, malloc, realloc) {
    if (realloc === undefined) {
        const buf = cachedTextEncoder.encode(arg);
        const ptr = malloc(buf.length, 1) >>> 0;
        getUint8ArrayMemory0().subarray(ptr, ptr + buf.length).set(buf);
        WASM_VECTOR_LEN = buf.length;
        return ptr;
    }

    let len = arg.length;
    let ptr = malloc(len, 1) >>> 0;

    const mem = getUint8ArrayMemory0();

    let offset = 0;

    for (; offset < len; offset++) {
        const code = arg.charCodeAt(offset);
        if (code > 0x7F) break;
        mem[ptr + offset] = code;
    }
    if (offset !== len) {
        if (offset !== 0) {
            arg = arg.slice(offset);
        }
        ptr = realloc(ptr, len, len = offset + arg.length * 3, 1) >>> 0;
        const view = getUint8ArrayMemory0().subarray(ptr + offset, ptr + len);
        const ret = cachedTextEncoder.encodeInto(arg, view);

        offset += ret.written;
        ptr = realloc(ptr, len, offset, 1) >>> 0;
    }

    WASM_VECTOR_LEN = offset;
    return ptr;
}

function takeFromExternrefTable0(idx) {
    const value = wasm.__wbindgen_externrefs.get(idx);
    wasm.__externref_table_dealloc(idx);
    return value;
}

let cachedTextDecoder = new TextDecoder('utf-8', { ignoreBOM: true, fatal: true });
cachedTextDecoder.decode();
const MAX_SAFARI_DECODE_BYTES = 2146435072;
let numBytesDecoded = 0;
function decodeText(ptr, len) {
    numBytesDecoded += len;
    if (numBytesDecoded >= MAX_SAFARI_DECODE_BYTES) {
        cachedTextDecoder = new TextDecoder('utf-8', { ignoreBOM: true, fatal: true });
        cachedTextDecoder.decode();
        numBytesDecoded = len;
    }
    return cachedTextDecoder.decode(getUint8ArrayMemory0().subarray(ptr, ptr + len));
}

const cachedTextEncoder = new TextEncoder();

if (!('encodeInto' in cachedTextEncoder)) {
    cachedTextEncoder.encodeInto = function (arg, view) {
        const buf = cachedTextEncoder.encode(arg);
        view.set(buf);
        return {
            read: arg.length,
            written: buf.length
        };
    }
}

let WASM_VECTOR_LEN = 0;

function wasm_bindgen__convert__closures_____invoke__hb416af42e65d8384(arg0, arg1, arg2) {
    wasm.wasm_bindgen__convert__closures_____invoke__hb416af42e65d8384(arg0, arg1, arg2);
}

function wasm_bindgen__convert__closures_____invoke__hfcf1e40543e16798(arg0, arg1) {
    wasm.wasm_bindgen__convert__closures_____invoke__hfcf1e40543e16798(arg0, arg1);
}

function wasm_bindgen__convert__closures_____invoke__h29813d6e0070b78b(arg0, arg1, arg2, arg3) {
    wasm.wasm_bindgen__convert__closures_____invoke__h29813d6e0070b78b(arg0, arg1, arg2, arg3);
}

const __wbindgen_enum_ReadableStreamType = ["bytes"];

const __wbindgen_enum_RequestCache = ["default", "no-store", "reload", "no-cache", "force-cache", "only-if-cached"];

const __wbindgen_enum_RequestCredentials = ["omit", "same-origin", "include"];

const __wbindgen_enum_RequestMode = ["same-origin", "no-cors", "cors", "navigate"];

const IntoUnderlyingByteSourceFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_intounderlyingbytesource_free(ptr >>> 0, 1));

const IntoUnderlyingSinkFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_intounderlyingsink_free(ptr >>> 0, 1));

const IntoUnderlyingSourceFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_intounderlyingsource_free(ptr >>> 0, 1));

const KaleidoClientFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_kaleidoclient_free(ptr >>> 0, 1));

const KaleidoConfigFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_kaleidoconfig_free(ptr >>> 0, 1));

const MakerClientFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_makerclient_free(ptr >>> 0, 1));

const RlnClientFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_rlnclient_free(ptr >>> 0, 1));

export class IntoUnderlyingByteSource {
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        IntoUnderlyingByteSourceFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_intounderlyingbytesource_free(ptr, 0);
    }
    /**
     * @returns {number}
     */
    get autoAllocateChunkSize() {
        const ret = wasm.intounderlyingbytesource_autoAllocateChunkSize(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * @param {ReadableByteStreamController} controller
     * @returns {Promise<any>}
     */
    pull(controller) {
        const ret = wasm.intounderlyingbytesource_pull(this.__wbg_ptr, controller);
        return ret;
    }
    /**
     * @param {ReadableByteStreamController} controller
     */
    start(controller) {
        wasm.intounderlyingbytesource_start(this.__wbg_ptr, controller);
    }
    /**
     * @returns {ReadableStreamType}
     */
    get type() {
        const ret = wasm.intounderlyingbytesource_type(this.__wbg_ptr);
        return __wbindgen_enum_ReadableStreamType[ret];
    }
    cancel() {
        const ptr = this.__destroy_into_raw();
        wasm.intounderlyingbytesource_cancel(ptr);
    }
}
if (Symbol.dispose) IntoUnderlyingByteSource.prototype[Symbol.dispose] = IntoUnderlyingByteSource.prototype.free;

export class IntoUnderlyingSink {
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        IntoUnderlyingSinkFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_intounderlyingsink_free(ptr, 0);
    }
    /**
     * @param {any} reason
     * @returns {Promise<any>}
     */
    abort(reason) {
        const ptr = this.__destroy_into_raw();
        const ret = wasm.intounderlyingsink_abort(ptr, reason);
        return ret;
    }
    /**
     * @returns {Promise<any>}
     */
    close() {
        const ptr = this.__destroy_into_raw();
        const ret = wasm.intounderlyingsink_close(ptr);
        return ret;
    }
    /**
     * @param {any} chunk
     * @returns {Promise<any>}
     */
    write(chunk) {
        const ret = wasm.intounderlyingsink_write(this.__wbg_ptr, chunk);
        return ret;
    }
}
if (Symbol.dispose) IntoUnderlyingSink.prototype[Symbol.dispose] = IntoUnderlyingSink.prototype.free;

export class IntoUnderlyingSource {
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        IntoUnderlyingSourceFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_intounderlyingsource_free(ptr, 0);
    }
    /**
     * @param {ReadableStreamDefaultController} controller
     * @returns {Promise<any>}
     */
    pull(controller) {
        const ret = wasm.intounderlyingsource_pull(this.__wbg_ptr, controller);
        return ret;
    }
    cancel() {
        const ptr = this.__destroy_into_raw();
        wasm.intounderlyingsource_cancel(ptr);
    }
}
if (Symbol.dispose) IntoUnderlyingSource.prototype[Symbol.dispose] = IntoUnderlyingSource.prototype.free;

/**
 * Kaleidoswap client for browser and Node.js environments
 */
export class KaleidoClient {
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        KaleidoClientFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_kaleidoclient_free(ptr, 0);
    }
    /**
     * Create a new Kaleidoswap client
     * @param {KaleidoConfig} config
     */
    constructor(config) {
        _assertClass(config, KaleidoConfig);
        var ptr0 = config.__destroy_into_raw();
        const ret = wasm.kaleidoclient_new(ptr0);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        this.__wbg_ptr = ret[0] >>> 0;
        KaleidoClientFinalization.register(this, this.__wbg_ptr, this);
        return this;
    }
    /**
     * Access the RGB/Lightning Node API
     * @returns {RlnClient}
     */
    get rln() {
        const ret = wasm.kaleidoclient_rln(this.__wbg_ptr);
        return RlnClient.__wrap(ret);
    }
    /**
     * Access the Market (Maker) API
     * @returns {MakerClient}
     */
    get maker() {
        const ret = wasm.kaleidoclient_maker(this.__wbg_ptr);
        return MakerClient.__wrap(ret);
    }
    /**
     * Check if the client has a node URL configured
     * @returns {boolean}
     */
    hasNode() {
        const ret = wasm.kaleidoclient_hasNode(this.__wbg_ptr);
        return ret !== 0;
    }
}
if (Symbol.dispose) KaleidoClient.prototype[Symbol.dispose] = KaleidoClient.prototype.free;

/**
 * Configuration for the Kaleidoswap client
 */
export class KaleidoConfig {
    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(KaleidoConfig.prototype);
        obj.__wbg_ptr = ptr;
        KaleidoConfigFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        KaleidoConfigFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_kaleidoconfig_free(ptr, 0);
    }
    /**
     * Set API key
     * @param {string | null} [api_key]
     */
    setApiKey(api_key) {
        var ptr0 = isLikeNone(api_key) ? 0 : passStringToWasm0(api_key, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        wasm.kaleidoconfig_setApiKey(this.__wbg_ptr, ptr0, len0);
    }
    /**
     * Get base URL
     * @returns {string}
     */
    getBaseUrl() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.kaleidoconfig_getBaseUrl(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * Set node URL
     * @param {string | null} [node_url]
     */
    setNodeUrl(node_url) {
        var ptr0 = isLikeNone(node_url) ? 0 : passStringToWasm0(node_url, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        wasm.kaleidoconfig_setNodeUrl(this.__wbg_ptr, ptr0, len0);
    }
    /**
     * Create a default configuration with a base URL
     * @param {string} base_url
     * @returns {KaleidoConfig}
     */
    static withDefaults(base_url) {
        const ptr0 = passStringToWasm0(base_url, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.kaleidoconfig_withDefaults(ptr0, len0);
        return KaleidoConfig.__wrap(ret);
    }
    /**
     * Create a new configuration
     * @param {string} base_url
     * @param {string | null | undefined} node_url
     * @param {string | null | undefined} api_key
     * @param {number} timeout
     * @param {number} max_retries
     * @param {number} cache_ttl
     */
    constructor(base_url, node_url, api_key, timeout, max_retries, cache_ttl) {
        const ptr0 = passStringToWasm0(base_url, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        var ptr1 = isLikeNone(node_url) ? 0 : passStringToWasm0(node_url, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len1 = WASM_VECTOR_LEN;
        var ptr2 = isLikeNone(api_key) ? 0 : passStringToWasm0(api_key, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len2 = WASM_VECTOR_LEN;
        const ret = wasm.kaleidoconfig_new(ptr0, len0, ptr1, len1, ptr2, len2, timeout, max_retries, cache_ttl);
        this.__wbg_ptr = ret >>> 0;
        KaleidoConfigFinalization.register(this, this.__wbg_ptr, this);
        return this;
    }
}
if (Symbol.dispose) KaleidoConfig.prototype[Symbol.dispose] = KaleidoConfig.prototype.free;

/**
 * Client for interacting with the Kaleidoswap Maker (Market API)
 */
export class MakerClient {
    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(MakerClient.prototype);
        obj.__wbg_ptr = ptr;
        MakerClientFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        MakerClientFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_makerclient_free(ptr, 0);
    }
    /**
     * List all available trading pairs
     * Returns a Promise that resolves to an array of TradingPair objects
     * @returns {Promise<any>}
     */
    listPairs() {
        const ret = wasm.makerclient_listPairs(this.__wbg_ptr);
        return ret;
    }
    /**
     * List all available assets
     * Returns a Promise that resolves to an array of Asset objects
     * @returns {Promise<any>}
     */
    listAssets() {
        const ret = wasm.makerclient_listAssets(this.__wbg_ptr);
        return ret;
    }
    /**
     * Execute/Confirm a swap
     * @param {any} request
     * @returns {Promise<any>}
     */
    executeSwap(request) {
        const ret = wasm.makerclient_executeSwap(this.__wbg_ptr, request);
        return ret;
    }
    /**
     * Get LSP information
     * @returns {Promise<any>}
     */
    getLspInfo() {
        const ret = wasm.makerclient_getLspInfo(this.__wbg_ptr);
        return ret;
    }
    /**
     * Get node information
     * @returns {Promise<any>}
     */
    getNodeInfo() {
        const ret = wasm.makerclient_getNodeInfo(this.__wbg_ptr);
        return ret;
    }
    /**
     * Get swap status by payment hash
     * @param {string} payment_hash
     * @returns {Promise<any>}
     */
    getSwapStatus(payment_hash) {
        const ptr0 = passStringToWasm0(payment_hash, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.makerclient_getSwapStatus(this.__wbg_ptr, ptr0, len0);
        return ret;
    }
    /**
     * Create a swap order
     * Request should be a CreateSwapOrderRequest object
     * @param {any} request
     * @returns {Promise<any>}
     */
    createSwapOrder(request) {
        const ret = wasm.makerclient_createSwapOrder(this.__wbg_ptr, request);
        return ret;
    }
    /**
     * Estimate LSP fees
     * @param {number} channel_size
     * @returns {Promise<any>}
     */
    estimateLspFees(channel_size) {
        const ret = wasm.makerclient_estimateLspFees(this.__wbg_ptr, channel_size);
        return ret;
    }
    /**
     * Get order history
     * @param {string | null | undefined} status
     * @param {number} limit
     * @param {number} skip
     * @returns {Promise<any>}
     */
    getOrderHistory(status, limit, skip) {
        var ptr0 = isLikeNone(status) ? 0 : passStringToWasm0(status, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        const ret = wasm.makerclient_getOrderHistory(this.__wbg_ptr, ptr0, len0, limit, skip);
        return ret;
    }
    /**
     * Get a quote by trading pair ticker
     * from_layer and to_layer should be "BTC_LN", "BTC_L1", "RGB_LN", "RGB_L1", etc.
     * @param {string} ticker
     * @param {number | null | undefined} from_amount
     * @param {number | null | undefined} to_amount
     * @param {string} from_layer
     * @param {string} to_layer
     * @returns {Promise<any>}
     */
    getQuoteByPair(ticker, from_amount, to_amount, from_layer, to_layer) {
        const ptr0 = passStringToWasm0(ticker, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(from_layer, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        const ptr2 = passStringToWasm0(to_layer, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len2 = WASM_VECTOR_LEN;
        const ret = wasm.makerclient_getQuoteByPair(this.__wbg_ptr, ptr0, len0, !isLikeNone(from_amount), isLikeNone(from_amount) ? 0 : from_amount, !isLikeNone(to_amount), isLikeNone(to_amount) ? 0 : to_amount, ptr1, len1, ptr2, len2);
        return ret;
    }
    /**
     * List only active trading pairs
     * @returns {Promise<any>}
     */
    listActivePairs() {
        const ret = wasm.makerclient_listActivePairs(this.__wbg_ptr);
        return ret;
    }
    /**
     * Get a trading pair by ticker (e.g., "BTC/USDT")
     * @param {string} ticker
     * @returns {Promise<any>}
     */
    getPairByTicker(ticker) {
        const ptr0 = passStringToWasm0(ticker, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.makerclient_getPairByTicker(this.__wbg_ptr, ptr0, len0);
        return ret;
    }
    /**
     * List only active assets
     * @returns {Promise<any>}
     */
    listActiveAssets() {
        const ret = wasm.makerclient_listActiveAssets(this.__wbg_ptr);
        return ret;
    }
    /**
     * Get an asset by ticker
     * @param {string} ticker
     * @returns {Promise<any>}
     */
    getAssetByTicker(ticker) {
        const ptr0 = passStringToWasm0(ticker, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.makerclient_getAssetByTicker(this.__wbg_ptr, ptr0, len0);
        return ret;
    }
    /**
     * Get order analytics
     * @returns {Promise<any>}
     */
    getOrderAnalytics() {
        const ret = wasm.makerclient_getOrderAnalytics(this.__wbg_ptr);
        return ret;
    }
    /**
     * Get a quote by asset tickers (convenience method)
     * @param {string} from_ticker
     * @param {string} to_ticker
     * @param {number | null | undefined} from_amount
     * @param {number | null | undefined} to_amount
     * @param {string} from_layer
     * @param {string} to_layer
     * @returns {Promise<any>}
     */
    getQuoteByAssets(from_ticker, to_ticker, from_amount, to_amount, from_layer, to_layer) {
        const ptr0 = passStringToWasm0(from_ticker, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(to_ticker, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        const ptr2 = passStringToWasm0(from_layer, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len2 = WASM_VECTOR_LEN;
        const ptr3 = passStringToWasm0(to_layer, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len3 = WASM_VECTOR_LEN;
        const ret = wasm.makerclient_getQuoteByAssets(this.__wbg_ptr, ptr0, len0, ptr1, len1, !isLikeNone(from_amount), isLikeNone(from_amount) ? 0 : from_amount, !isLikeNone(to_amount), isLikeNone(to_amount) ? 0 : to_amount, ptr2, len2, ptr3, len3);
        return ret;
    }
    /**
     * Get LSP network information
     * @returns {Promise<any>}
     */
    getLspNetworkInfo() {
        const ret = wasm.makerclient_getLspNetworkInfo(this.__wbg_ptr);
        return ret;
    }
    /**
     * Get swap order status
     * @param {string} order_id
     * @returns {Promise<any>}
     */
    getSwapOrderStatus(order_id) {
        const ptr0 = passStringToWasm0(order_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.makerclient_getSwapOrderStatus(this.__wbg_ptr, ptr0, len0);
        return ret;
    }
    /**
     * Initialize a swap directly with the Maker
     * @param {any} request
     * @returns {Promise<any>}
     */
    initSwap(request) {
        const ret = wasm.makerclient_initSwap(this.__wbg_ptr, request);
        return ret;
    }
}
if (Symbol.dispose) MakerClient.prototype[Symbol.dispose] = MakerClient.prototype.free;

/**
 * Client for interacting with the user's RGB Lightning Node
 */
export class RlnClient {
    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(RlnClient.prototype);
        obj.__wbg_ptr = ptr;
        RlnClientFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        RlnClientFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_rlnclient_free(ptr, 0);
    }
    /**
     * List peers on the RGB node
     * @returns {Promise<any>}
     */
    listPeers() {
        const ret = wasm.rlnclient_listPeers(this.__wbg_ptr);
        return ret;
    }
    /**
     * Initialize the node wallet
     * @param {string} password
     * @returns {Promise<any>}
     */
    initWallet(password) {
        const ptr0 = passStringToWasm0(password, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.rlnclient_initWallet(this.__wbg_ptr, ptr0, len0);
        return ret;
    }
    /**
     * Lock the node wallet
     * @returns {Promise<any>}
     */
    lockWallet() {
        const ret = wasm.rlnclient_lockWallet(this.__wbg_ptr);
        return ret;
    }
    /**
     * Connect to a peer on the RGB node
     * @param {any} request
     * @returns {Promise<any>}
     */
    connectPeer(request) {
        const ret = wasm.rlnclient_connectPeer(this.__wbg_ptr, request);
        return ret;
    }
    /**
     * Open a channel on the RGB node
     * @param {any} request
     * @returns {Promise<any>}
     */
    openChannel(request) {
        const ret = wasm.rlnclient_openChannel(this.__wbg_ptr, request);
        return ret;
    }
    /**
     * Close a channel on the RGB node
     * @param {any} request
     * @returns {Promise<any>}
     */
    closeChannel(request) {
        const ret = wasm.rlnclient_closeChannel(this.__wbg_ptr, request);
        return ret;
    }
    /**
     * List channels on the RGB node
     * @returns {Promise<any>}
     */
    listChannels() {
        const ret = wasm.rlnclient_listChannels(this.__wbg_ptr);
        return ret;
    }
    /**
     * List payments on the node
     * @returns {Promise<any>}
     */
    listPayments() {
        const ret = wasm.rlnclient_listPayments(this.__wbg_ptr);
        return ret;
    }
    /**
     * Unlock the node wallet
     * @param {string} password
     * @returns {Promise<any>}
     */
    unlockWallet(password) {
        const ptr0 = passStringToWasm0(password, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.rlnclient_unlockWallet(this.__wbg_ptr, ptr0, len0);
        return ret;
    }
    /**
     * Get BTC balance from the node
     * @returns {Promise<any>}
     */
    getBtcBalance() {
        const ret = wasm.rlnclient_getBtcBalance(this.__wbg_ptr);
        return ret;
    }
    /**
     * Whitelist a trade (if using a User Node)
     * @param {string} swapstring
     * @returns {Promise<any>}
     */
    whitelistTrade(swapstring) {
        const ptr0 = passStringToWasm0(swapstring, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.rlnclient_whitelistTrade(this.__wbg_ptr, ptr0, len0);
        return ret;
    }
    /**
     * Get the taker's pubkey from the local RGB Lightning Node.
     * This is a convenience method that extracts just the pubkey from getRgbNodeInfo.
     * @returns {Promise<any>}
     */
    getTakerPubkey() {
        const ret = wasm.rlnclient_getTakerPubkey(this.__wbg_ptr);
        return ret;
    }
    /**
     * List RGB assets on the node
     * @returns {Promise<any>}
     */
    listNodeAssets() {
        const ret = wasm.rlnclient_listNodeAssets(this.__wbg_ptr);
        return ret;
    }
    /**
     * Create a Lightning invoice on the node
     * @param {number | null} [amt_msat]
     * @param {number | null} [expiry_sec]
     * @param {number | null} [asset_amount]
     * @param {string | null} [asset_id]
     * @returns {Promise<any>}
     */
    createLnInvoice(amt_msat, expiry_sec, asset_amount, asset_id) {
        var ptr0 = isLikeNone(asset_id) ? 0 : passStringToWasm0(asset_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        const ret = wasm.rlnclient_createLnInvoice(this.__wbg_ptr, !isLikeNone(amt_msat), isLikeNone(amt_msat) ? 0 : amt_msat, !isLikeNone(expiry_sec), isLikeNone(expiry_sec) ? 0 : expiry_sec, !isLikeNone(asset_amount), isLikeNone(asset_amount) ? 0 : asset_amount, ptr0, len0);
        return ret;
    }
    /**
     * Decode a Lightning invoice
     * @param {string} invoice
     * @returns {Promise<any>}
     */
    decodeLnInvoice(invoice) {
        const ptr0 = passStringToWasm0(invoice, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.rlnclient_decodeLnInvoice(this.__wbg_ptr, ptr0, len0);
        return ret;
    }
    /**
     * Get asset balance from the node
     * @param {string} asset_id
     * @returns {Promise<any>}
     */
    getAssetBalance(asset_id) {
        const ptr0 = passStringToWasm0(asset_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.rlnclient_getAssetBalance(this.__wbg_ptr, ptr0, len0);
        return ret;
    }
    /**
     * Get RGB node information from the taker's local RGB Lightning Node.
     * Returns pubkey and other node info needed for swap execution.
     * @returns {Promise<any>}
     */
    getRgbNodeInfo() {
        const ret = wasm.rlnclient_getRgbNodeInfo(this.__wbg_ptr);
        return ret;
    }
    /**
     * Get a Bitcoin address from the node
     * @returns {Promise<any>}
     */
    getOnchainAddress() {
        const ret = wasm.rlnclient_getOnchainAddress(this.__wbg_ptr);
        return ret;
    }
    /**
     * Send a keysend payment
     * @param {any} request
     * @returns {Promise<any>}
     */
    keysend(request) {
        const ret = wasm.rlnclient_keysend(this.__wbg_ptr, request);
        return ret;
    }
}
if (Symbol.dispose) RlnClient.prototype[Symbol.dispose] = RlnClient.prototype.free;

/**
 * Get SDK name
 * @returns {string}
 */
export function getSdkName() {
    let deferred1_0;
    let deferred1_1;
    try {
        const ret = wasm.getSdkName();
        deferred1_0 = ret[0];
        deferred1_1 = ret[1];
        return getStringFromWasm0(ret[0], ret[1]);
    } finally {
        wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
    }
}

/**
 * Get SDK version
 * @returns {string}
 */
export function getVersion() {
    let deferred1_0;
    let deferred1_1;
    try {
        const ret = wasm.getVersion();
        deferred1_0 = ret[0];
        deferred1_1 = ret[1];
        return getStringFromWasm0(ret[0], ret[1]);
    } finally {
        wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
    }
}

export function init_panic_hook() {
    wasm.init_panic_hook();
}

/**
 * Convert smallest units to display units
 * @param {number} amount
 * @param {number} precision
 * @returns {number}
 */
export function toDisplayUnits(amount, precision) {
    const ret = wasm.toDisplayUnits(amount, precision);
    return ret;
}

/**
 * Convert display units to smallest units
 * @param {number} amount
 * @param {number} precision
 * @returns {number}
 */
export function toSmallestUnits(amount, precision) {
    const ret = wasm.toSmallestUnits(amount, precision);
    return ret;
}

export function __wbg_Error_52673b7de5a0ca89(arg0, arg1) {
    const ret = Error(getStringFromWasm0(arg0, arg1));
    return ret;
};

export function __wbg_Number_2d1dcfcf4ec51736(arg0) {
    const ret = Number(arg0);
    return ret;
};

export function __wbg_String_8f0eb39a4a4c2f66(arg0, arg1) {
    const ret = String(arg1);
    const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
    getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
};

export function __wbg___wbindgen_bigint_get_as_i64_6e32f5e6aff02e1d(arg0, arg1) {
    const v = arg1;
    const ret = typeof(v) === 'bigint' ? v : undefined;
    getDataViewMemory0().setBigInt64(arg0 + 8 * 1, isLikeNone(ret) ? BigInt(0) : ret, true);
    getDataViewMemory0().setInt32(arg0 + 4 * 0, !isLikeNone(ret), true);
};

export function __wbg___wbindgen_boolean_get_dea25b33882b895b(arg0) {
    const v = arg0;
    const ret = typeof(v) === 'boolean' ? v : undefined;
    return isLikeNone(ret) ? 0xFFFFFF : ret ? 1 : 0;
};

export function __wbg___wbindgen_debug_string_adfb662ae34724b6(arg0, arg1) {
    const ret = debugString(arg1);
    const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
    getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
};

export function __wbg___wbindgen_in_0d3e1e8f0c669317(arg0, arg1) {
    const ret = arg0 in arg1;
    return ret;
};

export function __wbg___wbindgen_is_bigint_0e1a2e3f55cfae27(arg0) {
    const ret = typeof(arg0) === 'bigint';
    return ret;
};

export function __wbg___wbindgen_is_function_8d400b8b1af978cd(arg0) {
    const ret = typeof(arg0) === 'function';
    return ret;
};

export function __wbg___wbindgen_is_object_ce774f3490692386(arg0) {
    const val = arg0;
    const ret = typeof(val) === 'object' && val !== null;
    return ret;
};

export function __wbg___wbindgen_is_string_704ef9c8fc131030(arg0) {
    const ret = typeof(arg0) === 'string';
    return ret;
};

export function __wbg___wbindgen_is_undefined_f6b95eab589e0269(arg0) {
    const ret = arg0 === undefined;
    return ret;
};

export function __wbg___wbindgen_jsval_eq_b6101cc9cef1fe36(arg0, arg1) {
    const ret = arg0 === arg1;
    return ret;
};

export function __wbg___wbindgen_jsval_loose_eq_766057600fdd1b0d(arg0, arg1) {
    const ret = arg0 == arg1;
    return ret;
};

export function __wbg___wbindgen_number_get_9619185a74197f95(arg0, arg1) {
    const obj = arg1;
    const ret = typeof(obj) === 'number' ? obj : undefined;
    getDataViewMemory0().setFloat64(arg0 + 8 * 1, isLikeNone(ret) ? 0 : ret, true);
    getDataViewMemory0().setInt32(arg0 + 4 * 0, !isLikeNone(ret), true);
};

export function __wbg___wbindgen_string_get_a2a31e16edf96e42(arg0, arg1) {
    const obj = arg1;
    const ret = typeof(obj) === 'string' ? obj : undefined;
    var ptr1 = isLikeNone(ret) ? 0 : passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    var len1 = WASM_VECTOR_LEN;
    getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
    getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
};

export function __wbg___wbindgen_throw_dd24417ed36fc46e(arg0, arg1) {
    throw new Error(getStringFromWasm0(arg0, arg1));
};

export function __wbg__wbg_cb_unref_87dfb5aaa0cbcea7(arg0) {
    arg0._wbg_cb_unref();
};

export function __wbg_abort_07646c894ebbf2bd(arg0) {
    arg0.abort();
};

export function __wbg_abort_399ecbcfd6ef3c8e(arg0, arg1) {
    arg0.abort(arg1);
};

export function __wbg_append_c5cbdf46455cc776() { return handleError(function (arg0, arg1, arg2, arg3, arg4) {
    arg0.append(getStringFromWasm0(arg1, arg2), getStringFromWasm0(arg3, arg4));
}, arguments) };

export function __wbg_arrayBuffer_c04af4fce566092d() { return handleError(function (arg0) {
    const ret = arg0.arrayBuffer();
    return ret;
}, arguments) };

export function __wbg_buffer_6cb2fecb1f253d71(arg0) {
    const ret = arg0.buffer;
    return ret;
};

export function __wbg_byobRequest_f8e3517f5f8ad284(arg0) {
    const ret = arg0.byobRequest;
    return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
};

export function __wbg_byteLength_faa9938885bdeee6(arg0) {
    const ret = arg0.byteLength;
    return ret;
};

export function __wbg_byteOffset_3868b6a19ba01dea(arg0) {
    const ret = arg0.byteOffset;
    return ret;
};

export function __wbg_call_3020136f7a2d6e44() { return handleError(function (arg0, arg1, arg2) {
    const ret = arg0.call(arg1, arg2);
    return ret;
}, arguments) };

export function __wbg_call_abb4ff46ce38be40() { return handleError(function (arg0, arg1) {
    const ret = arg0.call(arg1);
    return ret;
}, arguments) };

export function __wbg_clearTimeout_3b6a9a13d4bde075(arg0) {
    const ret = clearTimeout(arg0);
    return ret;
};

export function __wbg_close_0af5661bf3d335f2() { return handleError(function (arg0) {
    arg0.close();
}, arguments) };

export function __wbg_close_3ec111e7b23d94d8() { return handleError(function (arg0) {
    arg0.close();
}, arguments) };

export function __wbg_done_62ea16af4ce34b24(arg0) {
    const ret = arg0.done;
    return ret;
};

export function __wbg_enqueue_a7e6b1ee87963aad() { return handleError(function (arg0, arg1) {
    arg0.enqueue(arg1);
}, arguments) };

export function __wbg_entries_83c79938054e065f(arg0) {
    const ret = Object.entries(arg0);
    return ret;
};

export function __wbg_error_7534b8e9a36f1ab4(arg0, arg1) {
    let deferred0_0;
    let deferred0_1;
    try {
        deferred0_0 = arg0;
        deferred0_1 = arg1;
        console.error(getStringFromWasm0(arg0, arg1));
    } finally {
        wasm.__wbindgen_free(deferred0_0, deferred0_1, 1);
    }
};

export function __wbg_fetch_90447c28cc0b095e(arg0, arg1) {
    const ret = arg0.fetch(arg1);
    return ret;
};

export function __wbg_fetch_df3fa17a5772dafb(arg0) {
    const ret = fetch(arg0);
    return ret;
};

export function __wbg_get_6b7bd52aca3f9671(arg0, arg1) {
    const ret = arg0[arg1 >>> 0];
    return ret;
};

export function __wbg_get_af9dab7e9603ea93() { return handleError(function (arg0, arg1) {
    const ret = Reflect.get(arg0, arg1);
    return ret;
}, arguments) };

export function __wbg_get_with_ref_key_1dc361bd10053bfe(arg0, arg1) {
    const ret = arg0[arg1];
    return ret;
};

export function __wbg_has_0e670569d65d3a45() { return handleError(function (arg0, arg1) {
    const ret = Reflect.has(arg0, arg1);
    return ret;
}, arguments) };

export function __wbg_headers_654c30e1bcccc552(arg0) {
    const ret = arg0.headers;
    return ret;
};

export function __wbg_instanceof_ArrayBuffer_f3320d2419cd0355(arg0) {
    let result;
    try {
        result = arg0 instanceof ArrayBuffer;
    } catch (_) {
        result = false;
    }
    const ret = result;
    return ret;
};

export function __wbg_instanceof_Response_cd74d1c2ac92cb0b(arg0) {
    let result;
    try {
        result = arg0 instanceof Response;
    } catch (_) {
        result = false;
    }
    const ret = result;
    return ret;
};

export function __wbg_instanceof_Uint8Array_da54ccc9d3e09434(arg0) {
    let result;
    try {
        result = arg0 instanceof Uint8Array;
    } catch (_) {
        result = false;
    }
    const ret = result;
    return ret;
};

export function __wbg_isSafeInteger_ae7d3f054d55fa16(arg0) {
    const ret = Number.isSafeInteger(arg0);
    return ret;
};

export function __wbg_iterator_27b7c8b35ab3e86b() {
    const ret = Symbol.iterator;
    return ret;
};

export function __wbg_length_22ac23eaec9d8053(arg0) {
    const ret = arg0.length;
    return ret;
};

export function __wbg_length_d45040a40c570362(arg0) {
    const ret = arg0.length;
    return ret;
};

export function __wbg_new_1ba21ce319a06297() {
    const ret = new Object();
    return ret;
};

export function __wbg_new_25f239778d6112b9() {
    const ret = new Array();
    return ret;
};

export function __wbg_new_3c79b3bb1b32b7d3() { return handleError(function () {
    const ret = new Headers();
    return ret;
}, arguments) };

export function __wbg_new_6421f6084cc5bc5a(arg0) {
    const ret = new Uint8Array(arg0);
    return ret;
};

export function __wbg_new_881a222c65f168fc() { return handleError(function () {
    const ret = new AbortController();
    return ret;
}, arguments) };

export function __wbg_new_8a6f238a6ece86ea() {
    const ret = new Error();
    return ret;
};

export function __wbg_new_b546ae120718850e() {
    const ret = new Map();
    return ret;
};

export function __wbg_new_df1173567d5ff028(arg0, arg1) {
    const ret = new Error(getStringFromWasm0(arg0, arg1));
    return ret;
};

export function __wbg_new_ff12d2b041fb48f1(arg0, arg1) {
    try {
        var state0 = {a: arg0, b: arg1};
        var cb0 = (arg0, arg1) => {
            const a = state0.a;
            state0.a = 0;
            try {
                return wasm_bindgen__convert__closures_____invoke__h29813d6e0070b78b(a, state0.b, arg0, arg1);
            } finally {
                state0.a = a;
            }
        };
        const ret = new Promise(cb0);
        return ret;
    } finally {
        state0.a = state0.b = 0;
    }
};

export function __wbg_new_from_slice_f9c22b9153b26992(arg0, arg1) {
    const ret = new Uint8Array(getArrayU8FromWasm0(arg0, arg1));
    return ret;
};

export function __wbg_new_no_args_cb138f77cf6151ee(arg0, arg1) {
    const ret = new Function(getStringFromWasm0(arg0, arg1));
    return ret;
};

export function __wbg_new_with_byte_offset_and_length_d85c3da1fd8df149(arg0, arg1, arg2) {
    const ret = new Uint8Array(arg0, arg1 >>> 0, arg2 >>> 0);
    return ret;
};

export function __wbg_new_with_str_and_init_c5748f76f5108934() { return handleError(function (arg0, arg1, arg2) {
    const ret = new Request(getStringFromWasm0(arg0, arg1), arg2);
    return ret;
}, arguments) };

export function __wbg_next_138a17bbf04e926c(arg0) {
    const ret = arg0.next;
    return ret;
};

export function __wbg_next_3cfe5c0fe2a4cc53() { return handleError(function (arg0) {
    const ret = arg0.next();
    return ret;
}, arguments) };

export function __wbg_now_69d776cd24f5215b() {
    const ret = Date.now();
    return ret;
};

export function __wbg_prototypesetcall_dfe9b766cdc1f1fd(arg0, arg1, arg2) {
    Uint8Array.prototype.set.call(getArrayU8FromWasm0(arg0, arg1), arg2);
};

export function __wbg_queueMicrotask_9b549dfce8865860(arg0) {
    const ret = arg0.queueMicrotask;
    return ret;
};

export function __wbg_queueMicrotask_fca69f5bfad613a5(arg0) {
    queueMicrotask(arg0);
};

export function __wbg_resolve_fd5bfbaa4ce36e1e(arg0) {
    const ret = Promise.resolve(arg0);
    return ret;
};

export function __wbg_respond_9f7fc54636c4a3af() { return handleError(function (arg0, arg1) {
    arg0.respond(arg1 >>> 0);
}, arguments) };

export function __wbg_setTimeout_35a07631c669fbee(arg0, arg1) {
    const ret = setTimeout(arg0, arg1);
    return ret;
};

export function __wbg_set_169e13b608078b7b(arg0, arg1, arg2) {
    arg0.set(getArrayU8FromWasm0(arg1, arg2));
};

export function __wbg_set_3f1d0b984ed272ed(arg0, arg1, arg2) {
    arg0[arg1] = arg2;
};

export function __wbg_set_7df433eea03a5c14(arg0, arg1, arg2) {
    arg0[arg1 >>> 0] = arg2;
};

export function __wbg_set_body_8e743242d6076a4f(arg0, arg1) {
    arg0.body = arg1;
};

export function __wbg_set_cache_0e437c7c8e838b9b(arg0, arg1) {
    arg0.cache = __wbindgen_enum_RequestCache[arg1];
};

export function __wbg_set_credentials_55ae7c3c106fd5be(arg0, arg1) {
    arg0.credentials = __wbindgen_enum_RequestCredentials[arg1];
};

export function __wbg_set_efaaf145b9377369(arg0, arg1, arg2) {
    const ret = arg0.set(arg1, arg2);
    return ret;
};

export function __wbg_set_headers_5671cf088e114d2b(arg0, arg1) {
    arg0.headers = arg1;
};

export function __wbg_set_method_76c69e41b3570627(arg0, arg1, arg2) {
    arg0.method = getStringFromWasm0(arg1, arg2);
};

export function __wbg_set_mode_611016a6818fc690(arg0, arg1) {
    arg0.mode = __wbindgen_enum_RequestMode[arg1];
};

export function __wbg_set_signal_e89be862d0091009(arg0, arg1) {
    arg0.signal = arg1;
};

export function __wbg_signal_3c14fbdc89694b39(arg0) {
    const ret = arg0.signal;
    return ret;
};

export function __wbg_stack_0ed75d68575b0f3c(arg0, arg1) {
    const ret = arg1.stack;
    const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
    getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
};

export function __wbg_static_accessor_GLOBAL_769e6b65d6557335() {
    const ret = typeof global === 'undefined' ? null : global;
    return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
};

export function __wbg_static_accessor_GLOBAL_THIS_60cf02db4de8e1c1() {
    const ret = typeof globalThis === 'undefined' ? null : globalThis;
    return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
};

export function __wbg_static_accessor_SELF_08f5a74c69739274() {
    const ret = typeof self === 'undefined' ? null : self;
    return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
};

export function __wbg_static_accessor_WINDOW_a8924b26aa92d024() {
    const ret = typeof window === 'undefined' ? null : window;
    return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
};

export function __wbg_status_9bfc680efca4bdfd(arg0) {
    const ret = arg0.status;
    return ret;
};

export function __wbg_stringify_655a6390e1f5eb6b() { return handleError(function (arg0) {
    const ret = JSON.stringify(arg0);
    return ret;
}, arguments) };

export function __wbg_then_429f7caf1026411d(arg0, arg1, arg2) {
    const ret = arg0.then(arg1, arg2);
    return ret;
};

export function __wbg_then_4f95312d68691235(arg0, arg1) {
    const ret = arg0.then(arg1);
    return ret;
};

export function __wbg_url_b6d11838a4f95198(arg0, arg1) {
    const ret = arg1.url;
    const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
    getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
};

export function __wbg_value_57b7b035e117f7ee(arg0) {
    const ret = arg0.value;
    return ret;
};

export function __wbg_view_788aaf149deefd2f(arg0) {
    const ret = arg0.view;
    return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
};

export function __wbindgen_cast_2241b6af4c4b2941(arg0, arg1) {
    // Cast intrinsic for `Ref(String) -> Externref`.
    const ret = getStringFromWasm0(arg0, arg1);
    return ret;
};

export function __wbindgen_cast_3bc7e79f83d5f991(arg0, arg1) {
    // Cast intrinsic for `Closure(Closure { dtor_idx: 411, function: Function { arguments: [], shim_idx: 412, ret: Unit, inner_ret: Some(Unit) }, mutable: true }) -> Externref`.
    const ret = makeMutClosure(arg0, arg1, wasm.wasm_bindgen__closure__destroy__ha619a3d66b372a14, wasm_bindgen__convert__closures_____invoke__hfcf1e40543e16798);
    return ret;
};

export function __wbindgen_cast_4625c577ab2ec9ee(arg0) {
    // Cast intrinsic for `U64 -> Externref`.
    const ret = BigInt.asUintN(64, arg0);
    return ret;
};

export function __wbindgen_cast_9ae0607507abb057(arg0) {
    // Cast intrinsic for `I64 -> Externref`.
    const ret = arg0;
    return ret;
};

export function __wbindgen_cast_a0ba911f5f2154f2(arg0, arg1) {
    // Cast intrinsic for `Closure(Closure { dtor_idx: 478, function: Function { arguments: [Externref], shim_idx: 479, ret: Unit, inner_ret: Some(Unit) }, mutable: true }) -> Externref`.
    const ret = makeMutClosure(arg0, arg1, wasm.wasm_bindgen__closure__destroy__h6a14acc57b2e7da7, wasm_bindgen__convert__closures_____invoke__hb416af42e65d8384);
    return ret;
};

export function __wbindgen_cast_d6cd19b81560fd6e(arg0) {
    // Cast intrinsic for `F64 -> Externref`.
    const ret = arg0;
    return ret;
};

export function __wbindgen_init_externref_table() {
    const table = wasm.__wbindgen_externrefs;
    const offset = table.grow(4);
    table.set(0, undefined);
    table.set(offset + 0, undefined);
    table.set(offset + 1, null);
    table.set(offset + 2, true);
    table.set(offset + 3, false);
};
