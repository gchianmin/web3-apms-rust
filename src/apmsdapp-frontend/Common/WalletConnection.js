export const checkIfWalletIsConnected = async () => {
  try {
    const { solana } = window;
    if (solana) {
      if (solana.isPhantom) {

        const response = await solana.connect({
          onlyIfTruested: true,
        });
     
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
    return response.publicKey.toString();
  }
};
