export const checkIfWalletIsConnected = async () => {
  try {
    const { solana } = window;
    if (solana) {
      if (solana.isPhantom) {
        console.log("Phantom wallet found");
        const response = await solana.connect({
          onlyIfTruested: true,
        });
        console.log("Connected with public key", response.publicKey.toString());
        return response.publicKey.toString();
      }
    } else {
      alert("Solana object not found! Get a Phantom wallet");
    }
  } catch (error) {
    console.error(error);
  }
};

export const connectWallet = async () => {
  const { solana } = window;
  if (solana) {
    const response = await solana.connect();
    console.log("Connected with public key: ", response.publicKey.toString());
    return response.publicKey.toString();
  }
};
