import Image from "next/image";

export default function PageIcons(){
  return (
    <div className="mt-20 flex gap-2">
      <Image src="/icons/deliver.png" alt="Page Icon" width={48} height={48} />
      <Image src="/icons/user.png" alt="Page Icon" width={48} height={48} />
      <Image src="/icons/branch.png" alt="Page Icon" width={48} height={48} />
      <Image src="/icons/branch1.png" alt="Page Icon" width={48} height={48} />
    </div>
  )
}