import Image from "next/image";
import moreImage from "@/public/more.png";

export default function UserCard({type}:{type:string}){
  return (
    <div className="rounded-2xl odd:bg-secondary even:bg-principal p-4 flex-1">
        <div className="flex justify-between items-center">
            <span className="text-[10px] bg-white px-2 py-1 rounded-full text-green-600">2024/25</span>
            <Image src={moreImage} alt="more image" width={20} height={20}/>
        </div>
        <h1 className="text-2xl font-semibold my-4">1,234</h1>
        <h2 className="capitalize text-sm font-semibold text-gray-800">{type}</h2>
    </div>
  )
}
