import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { Cell, toNano } from '@ton/core';
import { TonMultiSender } from '../wrappers/TonMultiSender';
import '@ton/test-utils';
import { compile } from '@ton/blueprint';

describe('TonMultiSender', () => {
    let code: Cell;

    beforeAll(async () => {
        code = await compile('TonMultiSender');
    });

    let blockchain: Blockchain;
    let deployer: SandboxContract<TreasuryContract>;
    let tonMultiSender: SandboxContract<TonMultiSender>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();
        deployer = await blockchain.treasury('deployer');

        tonMultiSender = blockchain.openContract(
            TonMultiSender.createFromConfig(
                {
                    id: 0,
                    counter: 0,
                    owner: deployer.address,
                    sendExcessesToSender: 1
                },
                code
            )
        );


        const deployResult = await tonMultiSender.sendDeploy(deployer.getSender(), toNano('0.05'));

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: tonMultiSender.address,
            deploy: true,
            success: true,
        });
    });

    it('should deploy', async () => {
        // the check is done inside beforeEach
        // blockchain and tonMultiSender are ready to use
    });

    it('should send transactions', async () => {
        // the check is done inside beforeEach
        // blockchain and tonMultiSender are ready to use
        
        const newAddress = await blockchain.treasury('newAddress');
        const balanceBeforeNano = await newAddress.getBalance();
        const balanceBeforeTon = BigInt(balanceBeforeNano) / BigInt(1000000000);
        console.log('Balance before transaction (nano): ', balanceBeforeNano.toString());
        console.log('Balance before transaction (ton): ', balanceBeforeTon.toString());

        const additionalAddress1 = await blockchain.treasury('additionalAddress1');
        const additionalAddress1BalanceBeforeNano = await additionalAddress1.getBalance();
        const additionalAddress1BalanceBeforeTon = BigInt(additionalAddress1BalanceBeforeNano) / BigInt(1000000000);
        console.log('Additional Address 1 balance before transaction (nano): ', additionalAddress1BalanceBeforeNano.toString());
        console.log('Additional Address 1 balance before transaction (ton): ', additionalAddress1BalanceBeforeTon.toString());

        const additionalAddress2 = await blockchain.treasury('additionalAddress2');
        const additionalAddress2BalanceBeforeNano = await additionalAddress2.getBalance();
        const additionalAddress2BalanceBeforeTon = BigInt(additionalAddress2BalanceBeforeNano) / BigInt(1000000000);
        console.log('Additional Address 2 balance before transaction (nano): ', additionalAddress2BalanceBeforeNano.toString());
        console.log('Additional Address 2 balance before transaction (ton): ', additionalAddress2BalanceBeforeTon.toString());

        
        const txFee = toNano(0.05)

        const addresses =  [newAddress.address, additionalAddress1.address, additionalAddress2.address];

        const amounts = [toNano('1') + txFee, toNano('1') + txFee, toNano('3') + txFee];
        const totalAmount = amounts.reduce((partialSum, a) => partialSum + a, BigInt(0));
        
        const increasedValue =  totalAmount; // Increased value from 4 to 6

        const txResult = await tonMultiSender.sendTransaction(
            deployer.getSender(), {
                addresses,
                amounts,
                value: increasedValue + txFee * BigInt(amounts.length), // Using the increased value
                queryID: Date.now()
            }
        )

        expect(txResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: tonMultiSender.address,
            success: true,
        });




        const balanceAfterNano = await newAddress.getBalance();
        const balanceAfterTon = BigInt(balanceAfterNano) / BigInt(1000000000);
        console.log('Balance after transaction (nano): ', balanceAfterNano.toString());
        console.log('Balance after transaction (ton): ', balanceAfterTon.toString());

        const additionalAddress1BalanceAfterNano = await additionalAddress1.getBalance();
        const additionalAddress1BalanceAfterTon = BigInt(additionalAddress1BalanceAfterNano) / BigInt(1000000000);
        console.log('Additional Address 1 balance after transaction (nano): ', additionalAddress1BalanceAfterNano.toString());
        console.log('Additional Address 1 balance after transaction (ton): ', additionalAddress1BalanceAfterTon.toString());

        const additionalAddress2BalanceAfterNano = await additionalAddress2.getBalance();
        const additionalAddress2BalanceAfterTon = BigInt(additionalAddress2BalanceAfterNano) / BigInt(1000000000);
        console.log('Additional Address 2 balance after transaction (nano): ', additionalAddress2BalanceAfterNano.toString());
        console.log('Additional Address 2 balance after transaction (ton): ', additionalAddress2BalanceAfterTon.toString());

        expect(additionalAddress1BalanceAfterTon).toBe(additionalAddress1BalanceBeforeTon + (amounts[1] /BigInt(1000000000)));
        expect(additionalAddress2BalanceAfterTon).toBe(additionalAddress2BalanceBeforeTon + (amounts[2] /BigInt(1000000000)));

    });

    it('should send transactions with increased value and return excesses', async () => {
        // the check is done inside beforeEach
        // blockchain and tonMultiSender are ready to use
        const deployerBalanceBeforeNano = await deployer.getBalance();

        const deployerBalanceBeforeTon = BigInt(deployerBalanceBeforeNano) / BigInt(1000000000);
        console.log('Deployer Balance before transaction (nano): ', deployerBalanceBeforeNano.toString());
        console.log('Deployer Balance before transaction (ton): ', deployerBalanceBeforeTon.toString());

        
        const newAddress = await blockchain.treasury('newAddress');
        const balanceBeforeNano = await newAddress.getBalance();
        const balanceBeforeTon = BigInt(balanceBeforeNano) / BigInt(1000000000);
        console.log('Balance before transaction (nano): ', balanceBeforeNano.toString());
        console.log('Balance before transaction (ton): ', balanceBeforeTon.toString());

        const additionalAddress1 = await blockchain.treasury('additionalAddress1');
        const additionalAddress1BalanceBeforeNano = await additionalAddress1.getBalance();
        const additionalAddress1BalanceBeforeTon = BigInt(additionalAddress1BalanceBeforeNano) / BigInt(1000000000);
        console.log('Additional Address 1 balance before transaction (nano): ', additionalAddress1BalanceBeforeNano.toString());
        console.log('Additional Address 1 balance before transaction (ton): ', additionalAddress1BalanceBeforeTon.toString());

        const additionalAddress2 = await blockchain.treasury('additionalAddress2');
        const additionalAddress2BalanceBeforeNano = await additionalAddress2.getBalance();
        const additionalAddress2BalanceBeforeTon = BigInt(additionalAddress2BalanceBeforeNano) / BigInt(1000000000);
        console.log('Additional Address 2 balance before transaction (nano): ', additionalAddress2BalanceBeforeNano.toString());
        console.log('Additional Address 2 balance before transaction (ton): ', additionalAddress2BalanceBeforeTon.toString());

        const txFee = toNano(0.05)

        const addresses =  [newAddress.address, additionalAddress1.address, additionalAddress2.address];

        const amounts = [toNano('1') + txFee, toNano('1') + txFee, toNano('3') + txFee];
        const totalAmount = amounts.reduce((partialSum, a) => partialSum + a, BigInt(0));
        
        const increasedValue =  totalAmount +  toNano('2'); // Increased value from 4 to 6

        const txResult = await tonMultiSender.sendTransaction(
            deployer.getSender(), {
                addresses,
                amounts,
                value: increasedValue + txFee * BigInt(amounts.length), // Using the increased value
                queryID: Date.now()
            }
        )

        expect(txResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: tonMultiSender.address,
            success: true,
        });

        const balanceAfterNano = await newAddress.getBalance();
        const balanceAfterTon = BigInt(balanceAfterNano) / BigInt(1000000000);
        console.log('Balance after transaction (nano): ', balanceAfterNano.toString());
        console.log('Balance after transaction (ton): ', balanceAfterTon.toString());

        const additionalAddress1BalanceAfterNano = await additionalAddress1.getBalance();
        const additionalAddress1BalanceAfterTon = BigInt(additionalAddress1BalanceAfterNano) / BigInt(1000000000);
        console.log('Additional Address 1 balance after transaction (nano): ', additionalAddress1BalanceAfterNano.toString());
        console.log('Additional Address 1 balance after transaction (ton): ', additionalAddress1BalanceAfterTon.toString());

        const additionalAddress2BalanceAfterNano = await additionalAddress2.getBalance();
        const additionalAddress2BalanceAfterTon = BigInt(additionalAddress2BalanceAfterNano) / BigInt(1000000000);
        console.log('Additional Address 2 balance after transaction (nano): ', additionalAddress2BalanceAfterNano.toString());
        console.log('Additional Address 2 balance after transaction (ton): ', additionalAddress2BalanceAfterTon.toString());

        // Check if excesses have been returned to deployer address
        const deployerBalanceAfterNano = await deployer.getBalance();
        const deployerBalanceAfterTon = BigInt(deployerBalanceAfterNano) / BigInt(1000000000);
        console.log('Deployer balance after transaction (nano): ', deployerBalanceAfterNano.toString());
        console.log('Deployer balance after transaction (ton): ', deployerBalanceAfterTon.toString());

        // Assuming the excesses are the difference between the increased value and the total amount sent
        const expectedExcess = BigInt(increasedValue) - totalAmount; // 6 - 4 = 2
        const expectedExcessTon = expectedExcess / BigInt(1000000000);
        console.log('Expected excess in ton: ', expectedExcessTon.toString());

        // Check if the deployer balance has increased by the expected excess
        const deployerBalanceIncreaseNano = BigInt(deployerBalanceBeforeNano) - BigInt(deployerBalanceAfterNano);
        const deployerBalanceIncreaseTon = deployerBalanceIncreaseNano / BigInt(1000000000);
        console.log('Deployer balance increase in ton: ', deployerBalanceIncreaseTon.toString());

        expect(deployerBalanceAfterTon).toBe(deployerBalanceBeforeTon - (totalAmount/BigInt(1000000000)));
    });

    it('should update owner address', async () => {
        // Send a message to update the minting price
        const updateOwnerResult = await tonMultiSender.sendChangeOwner(deployer.getSender(), {
            value: toNano('0.01'),
            queryId: Date.now(),
            newOwnerAddress: deployer.address,
        });

        // Ensure transaction is successful
        expect(updateOwnerResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: tonMultiSender.address,
            success: true,
        });

        // Verify collection data has been updated
        const owner = await tonMultiSender.getOwner();
        expect(owner.toString()).toBe(deployer.address.toString());
    });

    it('should update send_excesses_to_sender', async () => {
        // Send a message to update the minting price
        const updateOwnerResult = await tonMultiSender.sendChangeSendExcessesToSender(deployer.getSender(), {
            value: toNano('0.01'),
            queryId: Date.now(),
            newValue: 0,
        });

        // Ensure transaction is successful
        expect(updateOwnerResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: tonMultiSender.address,
            success: true,
        });

        // Verify collection data has been updated
        const value = await tonMultiSender.getSendExcessesToSender();
        expect(value).toBe(0);
    });
    it('should update reset counter', async () => {
        // Send a message to update the minting price
        const updateOwnerResult = await tonMultiSender.sendResetCounter(deployer.getSender(), {
            value: toNano('0.01'),
            queryId: Date.now(),
            newValue: 1,
        });

        // Ensure transaction is successful
        expect(updateOwnerResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: tonMultiSender.address,
            success: true,
        });

        // Verify collection data has been updated
        const counter = await tonMultiSender.getCounter();
        const id = await tonMultiSender.getID();
        expect(counter).toBe(0);
        expect(id).toBe(0);
    });
});
