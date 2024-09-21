// app/components/ConnectButton.tsx

'use client';

import { useAccount, useConnect, useDisconnect } from 'wagmi';

const ConnectButton = () => {
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const { isConnected } = useAccount();

  return (
    <div>
      {!isConnected ? (
        connectors.map((connector) => (
        //   <button key={connector.id} onClick={() => connect(connector)}>
        //     Connect with {connector.name}
        //   </button>
        <div></div>
        ))
      ) : (
        <button onClick={() => disconnect()}>Disconnect</button>
      )}
    </div>
  );
};

export default ConnectButton;