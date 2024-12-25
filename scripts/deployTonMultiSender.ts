import { toNano } from '@ton/core';
import { TonMultiSender } from '../wrappers/TonMultiSender';
import { compile, NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
    const tonMultiSender = provider.open(
        TonMultiSender.createFromConfig(
            {
                id: Math.floor(Math.random() * 10000),
                counter: 0,
            },
            await compile('TonMultiSender')
        )
    );

    await tonMultiSender.sendDeploy(provider.sender(), toNano('0.05'));

    await provider.waitForDeploy(tonMultiSender.address);

    console.log('ID', await tonMultiSender.getID());
}
