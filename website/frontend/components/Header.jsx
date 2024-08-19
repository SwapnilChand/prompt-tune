import { ModeToggle } from "./ModeToggle"
import icon from '../assets/Icon.png'
import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function Header(props) {
    return (
        <div className="border-b w-full bg-blue-500 text-white">
            <div className="flex items-center justify-between h-16 px-8">
                <div className="flex gap-x-4 items-center">
                        <Image src="https://github.com/Cloud-Code-AI/kaizen/blob/main/assets/logo.png" className="h-6 w-auto" />
                        {/* <AvatarFallback>CC</AvatarFallback> */}
                    <h2 className="text-lg font-semibold">{props.title}</h2>
                </div>
                <ModeToggle />
            </div>
        </div>
    );
}