import { sanityClient, urlFor } from '@/sanity';
import { Collection } from '@/typings';
import { useAddress, useDisconnect, useMetamask, useContract } from '@thirdweb-dev/react'
import { GetServerSideProps } from 'next';
import Link from 'next/link';
import React, { useEffect, useState } from 'react'
import { BigNumber } from 'ethers'
import toast, { Toaster } from 'react-hot-toast';

interface Props {
  collection: Collection
}

function NFTDropPage({collection}: Props) {
  // auth
  const connectWithMetamask = useMetamask();
  const address = useAddress();
  const disconnect = useDisconnect();
  const { contract } = useContract(collection.address, 'nft-drop');
  // console.log(address);

  const [claimedSupply, setClaimedSupply] = useState<number>(0);
  const [totalSupply, setTotalSupply] = useState<BigNumber>();
  const [ethPrice, setEthPrice] = useState<string>();
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!contract) return;

    const fetchNftContractData = async () => {
      setLoading(true);
      const claimed = await contract.getAllClaimed();
      const total = await contract.totalSupply();

      setClaimedSupply(claimed.length);
      setTotalSupply(total);
      setLoading(false);
    }
    fetchNftContractData();
  }, [contract])

  useEffect(()=> {
    if (!contract) return
    const fetchPrice = async () => {
      const claimConditions = await contract.claimConditions.getAll();
      setEthPrice(claimConditions?.[0].currencyMetadata.displayValue)
    }
    fetchPrice();
  }, [contract]);

  const mintNft = () => {
    if (!contract || !address ) return;

    const quantity = 1;

    setLoading(true);
    const notification = toast.loading('Minting...', {
      style: {
        background: 'white',
        color: 'green',
        fontWeight: 'bolder',
        fontSize: '17px',
        padding: '20px',
      }
    })

    contract.claimTo(address, quantity).then(async (tx) => {
      const receipt = tx[0].receipt
      const claimedTokenId = tx[0].id
      const claimedNFT = await tx[0].data()

      toast('WOOHOO! you minted some magic', {
        duration: 8000,
        style: {
          background: 'green',
          color: 'white',
          fontWeight: 'bolder',
          fontSize: '17px',
          padding: '20px',
        }
      })

      console.log(receipt)
      console.log(claimedTokenId)
      console.log(claimedNFT)

    }).catch((err) => {
      console.log(err)
      toast('Whoops!...something went wrong', {
        duration: 8000,
        style: {
          background: 'red',
          color: 'white',
          fontWeight: 'bolder',
          fontSize: '17px',
          padding: '20px',
        }
      })
    }).finally(() => {
      setLoading(false);
      toast.dismiss(notification);
    });
  }

  return (
    // PARENT
    <div
      className='
        h-screen
        flex flex-col
        lg:grid lg:grid-cols-10
      '
    >
      <Toaster
        position='bottom-center'
      />
      {/* left */}
      <div
        className='
          bg-gradient-to-br from-cyan-800 to-rose-500
          lg:col-span-4
        '
      >
        <div
          className='
            flex flex-col items-center justify-center
            py-2
            lg:min-h-screen
          '
        >
          <div
            className='
              bg-gradient-to-br from-yellow-400 to-purple-600
              p-2 rounded-xl
            '
          >
            <img
              src={urlFor(collection.previewImage).url()}
              alt="nft"
              className='
                w-44 rounded-xl object-cover
                lg:h-96 lg:w-72
              '
            />
          </div>
          <div
            className='
              text-center
              p-5 space-y-2
            '
          >
            <h1
              className='text-4xl font-bold text-white capitalize'
            >
              {collection.title}
            </h1>
            <h2
              className='text-xl text-gray-300'
            >
              {collection.description}
            </h2>
          </div>
        </div>
      </div>
      {/* right */}
      <div
        className='
          flex flex-1 flex-col p-12
          lg:col-span-6
        '
      >
        {/* header */}
        <header
          className='
            flex items-center justify-between
          '
        >
          <Link href={'/'}>
            <h1
              className='
                w-52 cursor-pointer
                text-xl font-extralight
                sm:w-80
              '
            >
              Mint your own <span className='font-extrabold underline decoration-pink-600/50'>mushroom</span>
            </h1>
          </Link>
          <button
            className='
              rounded-full capitalize
              bg-rose-400 text-white
              px-4 py-2
              text-xs font-bold
              lg:px-5 lg:py-3 lg:text-base
            '
            onClick={() => address ? disconnect() : connectWithMetamask()}
          >
            {address ? 'sign out' : 'sign in'}
          </button>
        </header>
        <hr className='my-2 border'/>
        {address && (
          <p className='text-center text-sm text-rose-400'>
            you're logged in with {address.substring(0, 5)}...{address.substring(address.length - 5)}
          </p>
        )}
        {/* content */}
        <div
          className='
            mt-10 space-y-2
            flex flex-1 flex-col items-center
            text-center
            lg:space-y-0 lg:justify-center
          '
        >
          <img
            src={urlFor(collection.image).url()}
            alt="nft"
            className='
              w-80 object-cover pb-4
              lg:h-52 lg:object-top
            '
          />
          <h1
            className='
              text-3xl font-bold
              lg:text-5xl lg:font-extrabold
            '
          >
            Magic Mushrooms
          </h1>

          {loading ? (
            <>
              <p
                className='
                  pt-2
                  text-xl text-purple-500 animate-pulse
                '
              >
                loading supply count
              </p>
            </>
          ) : (
            <p
              className='
                pt-2
                text-xl text-green-500
              '
            >
              {claimedSupply}/{totalSupply?.toString()} NFT's claimed
            </p>
          )}
          
          {loading && (
            <img
              src="/loader.webp"
              alt=""
              className='h-16 w-16 pb-4 object-contain'
            />
          )}
          
        </div>
        {/* mint button */}
        <button
          className='
            h-16 w-full rounded-full
            bg-red-500 text-white
            font-bold capitalize
            disabled:bg-gray-400
          '
          disabled={loading || claimedSupply === totalSupply?.toNumber() || !address}
          onClick={mintNft}
        >
          {
            loading // first ternary
            ? (
            <>loading</>
          ) :
            claimedSupply === totalSupply?.toNumber() // nested ternary
           ? (
            <>SOLD OUT</>
          )
            : !address // deeply nested ternary
            ? (
            <>Sign in to mint</>
          ) : (
            <span className='font-bold'>
              mint NFT ({ethPrice} ETH)
            </span>
          )}
        </button>
      </div>
    </div>
  )
}

export default NFTDropPage;

export const getServerSideProps: GetServerSideProps = async({params}) => {
  const query = `
    *[_type == "collection" && slug.current == $id][0] {
      _id,
      title,
      address,
      description,
      collectionName,
      image {
        asset
      },
      previewImage {
        asset
      },
      slug {
        current
      },
      creator-> {
        _id,
        name,
        address,
        slug {
          current
        },
      },
    }
  `

  const collection = await sanityClient.fetch(query, {
    id: params?.id
  })

  if (!collection) {
    return {
      notFound: true
    }
  }

  return {
    props: {
      collection
    }
  }
}