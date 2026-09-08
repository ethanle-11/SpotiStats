type RankedListProps<T> = {
    title: string
    items: T[]
    getLabel: (item: T) => string
    getImage?: (item: T) => string
    getPlayCount?: (item: T) => string
}

function RankedList<T>({title, items, getLabel, getImage, getPlayCount}: RankedListProps<T>) {
    return (
            <div className="flex flex-col items-center">
                <h2 className="text-2xl text-white font-bold mb-4">{title}</h2>
                {items.map((item, index) => (
                    <div key={index} className="flex items-center justify-between w-3/4 mb-4 gap-6 bg-[#1a1a1a] rounded-lg p-3">
                        <div className="flex items-center gap-6">
                            <p className="text-white">{index + 1}.</p>
                            {getImage && <img src={getImage(item)} className="w-16 h-16 rounded" />} 
                            <p className="text-white">{getLabel(item)}</p>
                        </div>
                        <div>
                            <p className="text-white">{getPlayCount(item)}</p>
                        </div>
                    </div>
                ))}
            </div>
    )
}

export default RankedList