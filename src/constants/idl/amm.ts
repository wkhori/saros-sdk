/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `src/constants/amm_idl.json`.
 */
export type SarosSwap = {
  address: 'SSwapUtytfBdBn1b9NUGG6foMVPtcWgpRU32HToDUZr';
  metadata: {
    name: 'sarosSwap';
    version: '2.2.0';
    spec: '2.2.0';
    description: 'Saros AMM';
  };
  instructions: [
    {
      name: 'initialize';
      discriminator: [0];
      accounts: [
        {
          name: 'swapInfo';
          writable: true;
          signer: true;
        },
        {
          name: 'authorityInfo';
        },
        {
          name: 'tokenAInfo';
        },
        {
          name: 'tokenBInfo';
        },
        {
          name: 'poolMintInfo';
          writable: true;
        },
        {
          name: 'feeAccountInfo';
          writable: true;
        },
        {
          name: 'destinationInfo';
          writable: true;
        },
        {
          name: 'tokenProgramInfo';
        },
      ];
      args: [
        {
          name: 'fees';
          type: {
            defined: {
              name: 'Fees';
            };
          };
        },
        {
          name: 'swapCurve';
          type: {
            defined: {
              name: 'SwapCurve';
            };
          };
        },
        {
          name: 'swapCalculator';
          type: {
            array: ['u8', 32];
          };
        },
      ];
    },
    {
      name: 'swap';
      discriminator: [1];
      accounts: [
        {
          name: 'swapInfo';
          writable: true;
        },
        {
          name: 'authorityInfo';
          writable: true;
        },
        {
          name: 'userTransferAuthorityInfo';
          writable: true;
          signer: true;
        },
        {
          name: 'sourceInfo';
          writable: true;
        },
        {
          name: 'swapSourceInfo';
          writable: true;
        },
        {
          name: 'swapDestinationInfo';
          writable: true;
        },
        {
          name: 'destinationInfo';
          writable: true;
        },
        {
          name: 'poolMintInfo';
          writable: true;
        },
        {
          name: 'poolFeeAccountInfo';
          writable: true;
        },
        {
          name: 'tokenProgramInfo';
        },
      ];
      args: [
        {
          name: 'amountIn';
          type: 'u64';
        },
        {
          name: 'minimumAmountOut';
          type: 'u64';
        },
      ];
    },
    {
      name: 'depositAllTokenTypes';
      discriminator: [2];
      accounts: [
        {
          name: 'swapInfo';
        },
        {
          name: 'authorityInfo';
        },
        {
          name: 'userTransferAuthorityInfo';
          writable: true;
          signer: true;
        },
        {
          name: 'sourceAInfo';
          writable: true;
        },
        {
          name: 'sourceBInfo';
          writable: true;
        },
        {
          name: 'tokenAInfo';
          writable: true;
        },
        {
          name: 'tokenBInfo';
          writable: true;
        },
        {
          name: 'poolMintInfo';
          writable: true;
        },
        {
          name: 'destInfo';
          writable: true;
        },
        {
          name: 'tokenProgramInfo';
        },
      ];
      args: [
        {
          name: 'poolTokenAmount';
          type: 'u64';
        },
        {
          name: 'maximumTokenAAmount';
          type: 'u64';
        },
        {
          name: 'maximumTokenBAmount';
          type: 'u64';
        },
      ];
    },
    {
      name: 'withdrawAllTokenTypes';
      discriminator: [3];
      accounts: [
        {
          name: 'swapInfo';
        },
        {
          name: 'authorityInfo';
        },
        {
          name: 'userTransferAuthorityInfo';
          writable: true;
          signer: true;
        },
        {
          name: 'poolMintInfo';
          writable: true;
        },
        {
          name: 'sourceInfo';
          writable: true;
        },
        {
          name: 'tokenAInfo';
          writable: true;
        },
        {
          name: 'tokenBInfo';
          writable: true;
        },
        {
          name: 'destTokenAInfo';
          writable: true;
        },
        {
          name: 'destTokenBInfo';
          writable: true;
        },
        {
          name: 'poolFeeAccountInfo';
          writable: true;
        },
        {
          name: 'tokenProgramInfo';
        },
      ];
      args: [
        {
          name: 'poolTokenAmount';
          type: 'u64';
        },
        {
          name: 'minimumTokenAAmount';
          type: 'u64';
        },
        {
          name: 'minimumTokenBAmount';
          type: 'u64';
        },
      ];
    },
    {
      name: 'swapExactOut';
      discriminator: [6];
      accounts: [
        {
          name: 'swapInfo';
          writable: true;
        },
        {
          name: 'authorityInfo';
          writable: true;
        },
        {
          name: 'userTransferAuthorityInfo';
          writable: true;
          signer: true;
        },
        {
          name: 'sourceInfo';
          writable: true;
        },
        {
          name: 'swapSourceInfo';
          writable: true;
        },
        {
          name: 'swapDestinationInfo';
          writable: true;
        },
        {
          name: 'destinationInfo';
          writable: true;
        },
        {
          name: 'poolMintInfo';
          writable: true;
        },
        {
          name: 'poolFeeAccountInfo';
          writable: true;
        },
        {
          name: 'tokenProgramInfo';
        },
      ];
      args: [
        {
          name: 'amountOut';
          type: 'u64';
        },
        {
          name: 'maximumAmountIn';
          type: 'u64';
        },
      ];
    },
  ];
  accounts: [
    {
      name: 'Pair';
      discriminator: [];
    },
  ];
  types: [
    {
      name: 'Pair';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'version';
            type: 'u8';
          },
          {
            name: 'isInitialized';
            type: 'bool';
          },
          {
            name: 'bumpSeed';
            type: 'u8';
          },
          {
            name: 'tokenProgramId';
            type: 'pubkey';
          },
          {
            name: 'tokenA';
            type: 'pubkey';
          },
          {
            name: 'tokenB';
            type: 'pubkey';
          },
          {
            name: 'poolMint';
            type: 'pubkey';
          },
          {
            name: 'tokenAMint';
            type: 'pubkey';
          },
          {
            name: 'tokenBMint';
            type: 'pubkey';
          },
          {
            name: 'poolFeeAccount';
            type: 'pubkey';
          },
          {
            name: 'fees';
            type: {
              defined: {
                name: 'Fees';
              };
            };
          },
          {
            name: 'swapCurve';
            type: {
              defined: {
                name: 'SwapCurve';
              };
            };
          },
        ];
      };
    },
    {
      name: 'Fees';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'tradeFeeNumerator';
            type: 'u64';
          },
          {
            name: 'tradeFeeDenominator';
            type: 'u64';
          },
          {
            name: 'ownerTradeFeeNumerator';
            type: 'u64';
          },
          {
            name: 'ownerTradeFeeDenominator';
            type: 'u64';
          },
          {
            name: 'ownerWithdrawFeeNumerator';
            type: 'u64';
          },
          {
            name: 'ownerWithdrawFeeDenominator';
            type: 'u64';
          },
          {
            name: 'hostFeeNumerator';
            type: 'u64';
          },
          {
            name: 'hostFeeDenominator';
            type: 'u64';
          },
        ];
      };
    },
    {
      name: 'SwapCurve';
      type: {
        kind: 'enum';
        variants: [
          {
            name: 'ConstantProduct';
          },
          {
            name: 'ConstantPrice';
          },
          {
            name: 'Stable';
          },
          {
            name: 'Offset';
          },
        ];
      };
    },
  ];
};
