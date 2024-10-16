import { SCREEN_WIDTH } from "@/lib/constants/styles";
import useMinWidth from '@/hooks/useMinWidth'
import TooSmallScreen from './TooSmallScreen'
import { useMemo } from "react";

export default function GameContainer({ children }) {
	const { isValidSize, isLoaded } = useMinWidth(SCREEN_WIDTH)

	const content = useMemo(() => {
		if (!isLoaded) {
			return <p>loading...</p>
		}
		return isValidSize ? children : <TooSmallScreen />
	}, [children, isLoaded, isValidSize])

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-12">
			{content}
    </main>
  );
}