import Link from 'next/link';
import gameData from '@/lib/gameData';
import './globals.css';

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-900 text-white">
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center py-16 bg-gradient-to-r from-purple-600 via-indigo-500 to-blue-600">
        <h1 className="text-4xl md:text-6xl font-bold mb-4">Educational Client Work Demos</h1>
        <p className="text-lg md:text-xl text-gray-200 mb-8 text-center max-w-2xl">
          {`The following demos are a showcase of some games made for an educational client. 
          To protect intellectual property, each game is featured in a reduced format.`}
        </p>
      </section>

      {/* Game Cards Section */}
      <section className="p-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {gameData.map((game) => (
          <div
            key={game.name}
            className="bg-gray-800 hover:bg-gray-700 rounded-lg shadow-lg overflow-hidden hover:scale-105 transform transition-all duration-300"
          >
            <Link href={game.path}>
							<div className="p-6 flex flex-col items-center justify-center text-center gap-2 relative">
								<img
									alt={game.name + " icon background"}
									className="top-0"
									height="100%"
									width="100%"
									src={game.backgroundImage}
								/>
								<img
									alt={game.name + " title"}
									className="absolute w-1/2"
									height="100%"
									width="100%"
									src={game.titleImage}
								/>
							</div>
            </Link>
          </div>
        ))}
      </section>

      {/* Footer */}
      <footer className="py-8 text-center bg-gray-800 text-gray-400">
        <p>All games built by me, Eron Salling.</p>
				<Link className="hover:text-indigo-500 text-blue-600 text-bold" href="https://eronsalling.me">See more of my work</Link>
      </footer>
    </main>
  );
}
