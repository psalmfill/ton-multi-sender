import {
    Address,
    beginCell,
    Cell,
    Contract,
    contractAddress,
    ContractProvider,
    Dictionary,
    DictionaryValue,
    Sender,
    SendMode,
    toNano,
} from '@ton/core';

export type TonMultiSenderConfig = {
    id: number;
    counter: number;
    owner: Address;
    sendExcessesToSender: number;
};

export function tonMultiSenderConfigToCell(config: TonMultiSenderConfig): Cell {
    return beginCell()
        .storeUint(config.id, 256)
        .storeUint(config.counter, 256)
        .storeAddress(config.owner)
        .storeUint(config.sendExcessesToSender, 8)
        .endCell();
}

export const Opcodes = {
    send: 1,
    changeOwner: 2,
    changeSendExcessesToSender: 3,
    resetCounter: 4,
};

export class TonMultiSender implements Contract {
    constructor(
        readonly address: Address,
        readonly init?: { code: Cell; data: Cell },
    ) {}

    static createFromAddress(address: Address) {
        return new TonMultiSender(address);
    }

    static createFromConfig(config: TonMultiSenderConfig, code: Cell, workchain = 0) {
        const data = tonMultiSenderConfigToCell(config);
        const init = { code, data };
        return new TonMultiSender(contractAddress(workchain, init), init);
    }

    async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().endCell(),
        });
    }

    async sendTransaction(
        provider: ContractProvider,
        via: Sender,
        opts: {
            addresses: Address[];
            amounts: bigint[];
            value: bigint;
            queryID?: number;
        },
    ) {
        // Prepare the transfer dictionary
        const transferDict = Dictionary.empty(Dictionary.Keys.Uint(64), this.createMessageValue()); // Key: Uint(64)

        for (let i = 0; i < opts.addresses.length; i++) {
            transferDict.set(i + 1, {
                value: opts.amounts[i],
                destination: opts.addresses[i],
            }); // Use sequential BigInt keys starting from 1
        }

        return await provider.internal(via, {
            value: opts.value + toNano(0.05),
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell()
                .storeUint(Opcodes.send, 32) // Opcode for send
                .storeUint(opts.queryID ?? 0, 64) // Optional query ID (default 0)
                .storeCoins(opts.value) // Value for the transaction
                .storeDict(transferDict, Dictionary.Keys.Uint(64), {
                    serialize: (src: { value: number; destination: Address }, builder) => {
                        builder.storeCoins(src.value).storeAddress(src.destination);
                    },
                    parse: (src) => {
                        return { value: src.loadCoins(), destination: src.loadAddress() };
                    },
                }) // Store the transfer dictionary
                .endCell(),
        });
    }

    async sendChangeOwner(
        provider: ContractProvider,
        via: Sender,
        opts: {
            value: bigint;
            queryId: number;
            newOwnerAddress: Address;
        },
    ) {
        return await provider.internal(via, {
            value: opts.value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell()
                .storeUint(Opcodes.changeOwner, 32)
                .storeUint(opts.queryId, 64)
                .storeAddress(opts.newOwnerAddress) // Update mint price
                .endCell(),
        });
    }
    async sendChangeSendExcessesToSender(
        provider: ContractProvider,
        via: Sender,
        opts: {
            value: bigint;
            queryId: number;
            newValue: number;
        },
    ) {
        return await provider.internal(via, {
            value: opts.value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell()
                .storeUint(Opcodes.changeSendExcessesToSender, 32)
                .storeUint(opts.queryId, 64)
                .storeUint(opts.newValue, 8) // Update mint price
                .endCell(),
        });
    }

    async sendResetCounter(
        provider: ContractProvider,
        via: Sender,
        opts: {
            value: bigint;
            queryId: number;
            newValue: number;
        },
    ) {
        return await provider.internal(via, {
            value: opts.value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell()
                .storeUint(Opcodes.changeSendExcessesToSender, 32)
                .storeUint(opts.queryId, 64)
                .storeUint(opts.newValue, 8) // Update mint price
                .endCell(),
        });
    }

    createMessageValue(): DictionaryValue<any> {
        return {
            serialize: (src, builder) => {
                builder.storeCoins(src.value).storeAddress(src.destination);
            },
            parse: (src) => {
                return { value: src.loadCoins(), destination: src.loadAddress() };
            },
        };
    }

    async getCounter(provider: ContractProvider) {
        const result = await provider.get('get_counter', []);
        return result.stack.readNumber();
    }

    async getID(provider: ContractProvider) {
        const result = await provider.get('get_id', []);
        return result.stack.readNumber();
    }

    async getOwner(provider: ContractProvider) {
        const result = await provider.get('get_owner', []);
        return result.stack.readAddress();
    }

    async getSendExcessesToSender(provider: ContractProvider) {
        const result = await provider.get('get_send_excesses_to_sender', []);
        return result.stack.readNumber();
    }
}
