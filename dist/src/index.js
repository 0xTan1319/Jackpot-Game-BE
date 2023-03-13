"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PROGRAM_ID = exports.solConnection = exports.SOLANA_NETWORK = void 0;
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const web3_js_1 = require("@solana/web3.js");
const socket_io_1 = require("socket.io");
const script_1 = require("./script");
exports.SOLANA_NETWORK = "https://delicate-withered-theorem.solana-devnet.quiknode.pro/0399d35b8b5de1ba358bd014f584ba88d7709bcf/";
exports.solConnection = new web3_js_1.Connection(exports.SOLANA_NETWORK, "confirmed");
exports.PROGRAM_ID = "E13jNxzoQbUuyaZ9rYJUdRAirYZKU75NJNRV9CHdDhHE";
const app = (0, express_1.default)();
const port = process.env.PORT || 3002;
app.use((0, cors_1.default)());
app.use(body_parser_1.default.json());
app.use(body_parser_1.default.urlencoded({ extended: true }));
let counter = 0;
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});
io.on('connection', (socket) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("New Connection Established,ADD SOCKET");
    counter++;
    io.emit("connectionUpdated", counter);
    socket.on('disconnect', (socket) => __awaiter(void 0, void 0, void 0, function* () {
        console.log("New Connection Established, REMOVE COUTNER__");
        counter--;
        io.emit("connectionUpdated", counter);
    }));
}));
app.post('/writeMessage', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let user = req.body.user;
        let msg = req.body.msg;
        let conq;
        const ts = new Date().getTime();
        let result = yield (0, script_1.getLastMsgIx)();
        if (!result)
            result = [];
        let midResult = yield (0, script_1.addMessageIx)(user, msg);
        let newMsg;
        if (!midResult) {
            newMsg = {
                user_name: user,
                message: msg,
                timestamp: ts,
            };
        }
        conq = [newMsg !== null && newMsg !== void 0 ? newMsg : newMsg, ...result];
        // send data with socket
        io.emit("chatUpdated", conq);
        res.send(JSON.stringify(conq ? conq : -200));
        return;
    }
    catch (e) {
        console.log(e, ">> error occured from receiving deposit request");
        res.send(JSON.stringify(-1));
        return;
    }
}));
app.get('/getMessage', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let result = yield (0, script_1.getLastMsgIx)();
        res.send(JSON.stringify(result ? result : -200));
        return;
    }
    catch (e) {
        console.log(e, ">> error occured from receiving deposit request");
        res.send(JSON.stringify(-1));
        return;
    }
}));
app.post('/createGame', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const txId = req.body.txId;
        console.log(txId);
        if (!txId) {
            res.send(JSON.stringify(-100));
            return;
        }
        const result = yield (0, script_1.performTx)(txId, io);
        res.send(JSON.stringify(result ? 0 : -200));
    }
    catch (e) {
        console.log(e, ">>> Error");
        res.send(JSON.stringify(-2));
        return;
    }
}));
app.post('/enterGame', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const txId = req.body.txId;
        console.log(txId);
        if (!txId) {
            res.send(JSON.stringify(-100));
            return;
        }
        const result = yield (0, script_1.performTx)(txId, io);
        res.send(JSON.stringify(result ? 0 : -200));
    }
    catch (e) {
        console.log(e, ">>> Error");
        res.send(JSON.stringify(-2));
        return;
    }
}));
app.get('/getRecentGame', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const pdaData = yield (0, script_1.getLastPdaIx)();
        if (!pdaData)
            return;
        const pdaAddress = pdaData.pda;
        let gameData;
        if (pdaData.pda != "") {
            gameData = yield (0, script_1.getResult)(new web3_js_1.PublicKey(pdaAddress));
        }
        const result = {
            pda: pdaData.pda,
            endTimestamp: pdaData.endTime ? pdaData.endTime : 0,
            players: gameData
        };
        res.send(JSON.stringify(result ? result : -200));
    }
    catch (e) {
        console.log(e, ">>> Error");
        res.send(JSON.stringify(-2));
        return;
    }
}));
server.listen(port, () => {
    console.log(`server is listening on ${port}`);
    // attachRewardTransactionListener(io);
    return;
});
