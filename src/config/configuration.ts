export interface EnvironmentVariables {
  ETHEREUM_RPC_URL: string;
  ETHEREUM_PRIVATE_KEY: string;
  CONTRACT_ADDRESS: string;
  MONGODB_URI: string;
  JWT_SECRET: string;
  JWT_EXPIRATION: string;
}

export default () => ({
  ethereum: {
    infuraProjectId: process.env.INFURA_PROJECT_ID,
    privateKey: process.env.ETHEREUM_PRIVATE_KEY,
    contractAddress: process.env.CONTRACT_ADDRESS,
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiration: process.env.JWT_EXPIRATION || '24h',
  },
  database: {
    uri: process.env.MONGODB_URI,
  },
}); 