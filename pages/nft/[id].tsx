import { sanityClient, urlFor } from '@/sanity';
import { Collection } from '@/typings';
import { useAddress, useDisconnect, useMetamask } from '@thirdweb-dev/react'
import { GetServerSideProps } from 'next';
import React from 'react'

interface Props {
  collection: Collection
}

function NFTDropPage({collection}: Props) {
  // auth
  const connectWithMetamask = useMetamask();
  const address = useAddress();
  const disconnect = useDisconnect();
  // console.log(address);

  return (
    // PARENT
    <div
      className='
        h-screen
        flex flex-col
        lg:grid lg:grid-cols-10
      '
    >
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
              A collection of magic mushrooms on the blockchain!
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
          <h1
            className='
              w-52 cursor-pointer
              text-xl font-extralight
              sm:w-80
            '
          >
            Mint your own <span className='font-extrabold underline decoration-pink-600/50'>mushroom</span>
          </h1>
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
          <p
            className='
              pt-2
              text-xl text-green-500
              
            '
          >
            13/21 NFT's claimed
          </p>
        </div>
        {/* mint button */}
        <button
          className='
            h-16 w-full rounded-full
            bg-red-500 text-white
            font-bold capitalize
          '
        >
          mint NFT (0.01 ETH)
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