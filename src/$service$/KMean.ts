// Простая реализация k-means кластеризации
const kMeans = (data, k) => {
    let centroids = initializeCentroids(data, k);
    let clusters;

    //
    for (let iteration = 0; iteration < 10; iteration++) { // Ограничиваем число итераций
        clusters = Array.from({ length: k }, () => ({ points: [], mean: null }));

        // Распределяем точки по ближайшим центроидам
        data.forEach(point => {
            let closestCentroidIndex = 0;
            let minDistance = 10000;

            centroids.forEach((centroid, index) => {
                const distance = euclideanDistance(point, centroid);
                if (distance < minDistance) {
                    minDistance = distance;
                    closestCentroidIndex = index;
                }
            });

            clusters[closestCentroidIndex].points.push(point);
        });

        // Пересчитываем центры кластеров как среднее их точек
        centroids = clusters.map(cluster => {
            if (cluster.points.length === 0) {
                // Если кластер пустой, оставляем старый центр
                return centroids[clusters.indexOf(cluster)];
            }
            const mean = cluster.points.reduce(
                (acc, point) => acc.map((val, i) => val + point[i]),
                [0, 0, 0]
            ).map(val => val / cluster.points.length);
            cluster.mean = mean;
            return mean;
        });
    }

    return clusters;
}

// Функция для вычисления евклидова расстояния между двумя точками
const euclideanDistance = (point1, point2) => {
    return Math.sqrt(
        point1.reduce((sum, val, i) => sum + Math.pow(val - point2[i], 2), 0)
    );
}

// Инициализация центроидов случайным образом из данных
const initializeCentroids = (data: [], k) => {
    const centroids = [];
    const usedIndices = new Set();
    while (centroids.length < k) {
        const index = Math.floor(((centroids.length + Math.random()) / k) * data.length);
        if (!usedIndices.has(index)) {
            usedIndices.add(index);
            centroids.push(data[index]);
        }
    }
    return centroids;
}

//
const preBlurPixels = async (imgURL)=>{
    const blob   = (imgURL instanceof Blob || imgURL instanceof File) ? imgURL : (await fetch(imgURL)?.then?.((r)=>r?.blob?.()));
    const bitmap = await createImageBitmap(blob);
    
    //
    const offset = new OffscreenCanvas(bitmap.width * 0.125, bitmap.height * 0.125);
    const ctx: any = offset.getContext("2d"); ctx.filter = "blur(16px)"; ctx?.drawImage?.(bitmap, 0, 0, offset.width, offset.height);
    return offset;
}

//
const getClusterImageData = async (imgURL)=>{
    const bitmap = await preBlurPixels(imgURL);
    const offset = new OffscreenCanvas(bitmap.width * 0.125, bitmap.height * 0.125);
    const ctx: any = offset.getContext("2d");
    ctx?.drawImage?.(bitmap, 0, 0, offset.width, offset.height);
    
    //
    const img = ctx?.getImageData?.(0, 0, offset.width, offset.height, {
        storageFormat: "float32",
        colorSpace: "srgb"
    });
    
    //
    const dv: number = 1 / 255;
    const fp32: any[] = [];
    const data = img.data;
    const count = (offset.width*offset.height)||0;
    for (let i=0;i<count;i++) {
        const i4 = i*4;
        fp32.push((data instanceof Float32Array || data instanceof Float16Array) ? [
            (data?.[i4+0]||0),
            (data?.[i4+1]||0),
            (data?.[i4+2]||0)
        ] : [
            (data?.[i4+0]||0) * dv, 
            (data?.[i4+1]||0) * dv, 
            (data?.[i4+2]||0) * dv
        ]);
    }
    
    //
    return fp32;
}

//
export const getDominantColors = async (imgURL: any)=>{
    const data = await getClusterImageData(imgURL);
    return kMeans(data, 1);
}
