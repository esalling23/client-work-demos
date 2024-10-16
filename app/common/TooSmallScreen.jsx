import { SCREEN_WIDTH } from "@/lib/constants/styles"
import { redirect } from "next/navigation"

const TooSmallScreen = () => {
	return (
		<div className="z-10 w-full max-w-5xl items-center justify-center font-mono text-sm lg:flex">
			<h3>Sorry, these games are only supported on windows wider than {SCREEN_WIDTH} pixels.</h3>
			<button 
				className="rounded bg-yellow-500 hover:bg-yellow-400 hover:scale-1.1 py-2 px-6"
				onClick={() => redirect('?mobile=true')}
			>Take me to the mobile demos</button>
		</div>
	)
}

export default TooSmallScreen