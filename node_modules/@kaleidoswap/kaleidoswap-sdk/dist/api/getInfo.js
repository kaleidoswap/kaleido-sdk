"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getInfo = void 0;
const getInfo = async (client) => {
    return await client.get("/api/v1/lsps1/get_info");
};
exports.getInfo = getInfo;
//# sourceMappingURL=getInfo.js.map