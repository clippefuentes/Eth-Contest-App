const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');
const web3 = new Web3(ganache.provider());
const { interface, bytecode } = require('../compile');

let contest;
let accounts;

beforeEach(async () => {
    accounts = await web3.eth.getAccounts();
    contest = await new web3.eth.Contract(JSON.parse(interface))
        .deploy({ data: bytecode })
        .send({ from: accounts[0], gas: '1000000'})
})

describe('Giveaway contract', () => {
    it('Can Deploy a contract', () => {
        assert.ok(contest.options.address);
    });

    it('can allow an account to enter', async () => {
        await contest.methods.registration('1', '111', '11111@email.com')
            .send({
                from: accounts[0],
                value: web3.utils.toWei('0.02', 'ether'),
                gas: '1000000'
            });
        
        const addresses = await contest.methods.getParticipants()
            .call({
                from: accounts[0]
            });

        assert.equal(accounts[0], addresses[0]);
    });

    it('requires a little ether to enter', async () => {
        try {
            await contest.methods.enter().send({
                from: accounts[0],
                value: 200
            });
            assert(false);
        } catch (err) {
            assert(err);
        }
    })

    it('Allows multiple accoutns to enter the contest', async () => {
        await contest.methods.registration('1', '11', '111')
            .send({
                from: accounts[0],
                value: web3.utils.toWei('0.02', 'ether'),
                gas: '1000000'
            });
        await contest.methods.registration('2', '22', '222')
        .send({
            from: accounts[1],
            value: web3.utils.toWei('0.02', 'ether'),
            gas: '1000000'
        });
        await contest.methods.registration('33', '333', '333')
        .send({
            from: accounts[2],
            value: web3.utils.toWei('0.02', 'ether'),
            gas: '1000000'
        });

        const participants = await contest.methods.getParticipants()
        .call({
            from: accounts[0]
        });

        assert.equal(accounts[0], participants[0]);
        assert.equal(accounts[1], participants[1]);
        assert.equal(accounts[2], participants[2]);
        assert.equal(3, participants.length);
    });

    it('allows only the manager to select a winner', async () => {
        try {
            await contest.methods.pickWinner()
            .send({
                from: accounts[1]
            });
            assert(false)
        } catch (err) {
            assert(err)
        }
    });

    it('sends the prize money to the winner', async () => {
        await contest.methods.registration('1', '11', '111')
            .send({
                from: accounts[1],
                value: web3.utils.toWei('0.02', 'ether'),
                gas: '1000000'
            })
        
        const accountInitialBalance = await web3.eth.getBalance(accounts[1]);

        await contest.methods.pickWinner()
            .send({
                from: accounts[0]
            });

        await contest.methods.transferAmount()
            .send({
                from: accounts[0],
                value: web3.utils.toWei('0.04', 'ether')
            })

        const finalBalance = await web3.eth.getBalance(accounts[1]);

        assert(accountInitialBalance < finalBalance);
        const contestBalance = await web3.eth.getBalance(contest.options.address);
        assert(contestBalance == 0);
    });
});