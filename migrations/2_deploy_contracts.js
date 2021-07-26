const Factory = artifacts.require('uniswapv2/UniswapV2Factory.sol');
const Router1 = artifacts.require('uniswapv2/UniswapV2Router01.sol');
const Router = artifacts.require('uniswapv2/UniswapV2Router02.sol');
const WETH = artifacts.require('mocks/WETH9Mock.sol');
const MockERC20 = artifacts.require('mocks/ERC20Mock.sol');
const JollofToken = artifacts.require('JollofToken.sol');
const MamaPut = artifacts.require('MamaPut.sol');
const JollofShed = artifacts.require('JollofShed.sol');
const JollofMaker = artifacts.require('JollofMaker.sol');
const Migrator = artifacts.require('Migrator.sol');
const MamaPutV2 = artifacts.require('MamaPutV2.sol');
const Timelock = artifacts.require('./governance/Timelock.sol');
const JollofPlate = artifacts.require('JollofPlate.sol');
// const PeggedOracleV1 = artifacts.require('./bentobox/PeggedOracleV1.sol');
// const KashiPairMediumRiskV1 = artifacts.require('./bentobox/KashiPairMediumRiskV1.sol');
// const JollofMakerKpomo = artifacts.require('JollofMakerKpomo.sol');
// const BentoBoxV1 = artifacts.require('./bentobox/BentoBoxV1.sol');

module.exports = async function(deployer, _network, addresses) {
	const [admin, _] = addresses;

	await deployer.deploy(WETH);
	const weth = await WETH.deployed();
	const tokenA = await MockERC20.new('Token A', 'TKA', web3.utils.toWei('1000'));
	const tokenB = await MockERC20.new('Token B', 'TKB', web3.utils.toWei('1000'));

	await deployer.deploy(Factory, admin);
	const factory = await Factory.deployed();
	await factory.createPair(weth.address, tokenA.address);
	await factory.createPair(weth.address, tokenB.address);

	await deployer.deploy(Router1, factory.address, weth.address);
	const router1 = await Router1.deployed();

	await deployer.deploy(Router, factory.address, weth.address);
	const router = await Router.deployed();

	await deployer.deploy(JollofToken);
	const jollofToken = await JollofToken.deployed();

	await deployer.deploy(
		MamaPut,
		jollofToken.address,
		admin,
		web3.utils.toWei('100'),
		1,
		10
	);
	const mamaPut = await MamaPut.deployed();
	await jollofToken.transferOwnership(mamaPut.address);

	await deployer.deploy(JollofShed, jollofToken.address);
	const jollofShed = await JollofShed.deployed();

	await deployer.deploy(
		JollofMaker,
		factory.address,
		JollofShed.address,
		jollofToken.address,
		weth.address
	);
	const jollofMaker = await JollofMaker.deployed();
	await factory.setFeeTo(jollofMaker.address);

	await deployer.deploy(
		Migrator,
		mamaPut.address,
		'0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f',
		factory.address,
		1
	);

	await deployer.deploy(
		MamaPutV2,
		factory.address,
		jollofToken.address,
		1
	);
	const mamaPutV2 = await MamaPutV2.deployed();


	// Timelock
	await deployer.deploy(
		Timelock,
		admin,
		172801
	);
	const timelock = await Timelock.deployed();


	await deployer.deploy(
		JollofPlate,
		router1.address,
		router.address
	);
	const jollofPlate = await JollofPlate.deployed();


	// // PeggedOracle
	// await deployer.deploy(PeggedOracleV1);
	// const peggedOracleV1 = await PeggedOracleV1.deployed();


	// // KashiPairMediumRiskV1
	// await deployer.deploy(KashiPairMediumRiskV1, 10);
	// const kashiPairMediumRiskV1 = await KashiPairMediumRiskV1.deployed();


	// await deployer.deploy(
	// 	BentoBoxV1,
	// 	factory.address,
	// );
	// const bentoBoxV1 = await BentoBoxV1.deployed();

};