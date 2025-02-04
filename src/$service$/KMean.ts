// @ts-ignore
import { oklch, formatCss } from "culori";

//
const sortColors = (list, criteria = "l")=>{
    return list.sort((a, b)=>{
        const ac = oklch({mode: 'rgb', r: a[0], g: a[1], b: a[2]});
        const bc = oklch({mode: 'rgb', r: b[0], g: b[1], b: b[2]});
        return (Math.sign(ac?.[criteria] - bc?.[criteria])||0);
    });
}

//
const euclideanDistance = (color1, color2) => {
    return Math.hypot(
        color1[0] - color2[0], 
        color1[1] - color2[1], 
        color1[2] - color2[2]
    );
}

//euclideanDistance
const makeClusters = (data: [number, number, number][], centroids: [number, number, number][])=>{
    let clusters  = Array.from({ length: centroids.length }, () => ({ 
        points: [] as [number, number, number][],
        mean: null as ([number, number, number]|null)
    }));

    //
    data.forEach((point: [number, number, number]) => {
        let minDistance = 10000;
        let minDistanceClusterIndex = 0;
        centroids.forEach((centroid, index) => {
            const distance = euclideanDistance(point, centroid);
            if (typeof minDistance === 'undefined' || minDistance > distance) {
                minDistance = distance;
                minDistanceClusterIndex = index;
            }
        });
        clusters[minDistanceClusterIndex].points.push(point);
    });

    //
    return clusters;
}

//
const computeMean = (points: [number, number, number][])=>{
    return points?.length > 0 ? (points
        .reduce((acc, point) => [point[0]+acc[0], point[1]+acc[1], point[2]+acc[2]], [0, 0, 0])
        .map(val => val / points.length) as [number, number, number]) : [0, 0, 0];
}

// General means per K-clusters
const kMeans = (data, k) => {
    let centroids: [number, number, number][] = sortColors(initializeCentroids(data, k));
    
    const maxIterations = 10;
    /*for (let iteration = 0; iteration < maxIterations; iteration++) {
        let clusters = makeClusters(data, centroids);
        centroids = clusters.map((cluster, i) => {
            if (cluster.points.length < 1) { return centroids[i]; };
            return computeMean(cluster.points);
        }) as [number, number, number][];
    }
    */
    
    for (let iteration = 0; iteration < maxIterations; iteration++) {
        let clusters = makeClusters(data, centroids);
        const newCentroids = clusters.map((cluster) =>
            cluster.points.length > 0 ? computeMean(cluster.points) : null
        );

        // Проверяем изменение центроидов
        if (
            newCentroids.every((newCentroid, index) =>
                newCentroid &&
                euclideanDistance(newCentroid as [number, number, number], centroids[index]) < 0.001
            )
        ) {
            break; // Алгоритм сошёлся
        }
    
        centroids = newCentroids as [number, number, number][];
    }
    
    //
    return centroids;
}

// uniform colors with random ranging
/*const initializeCentroids = (data: [number, number, number][], k): [number, number, number][] => {
    const centroids: [number, number, number][] = [];
    const usedIndices = new Set();
    while (centroids.length < k) {
        const index = Math.floor(((centroids.length + Math.random()) / k) * data.length);
        if (!usedIndices.has(index)) {
            usedIndices.add(index);
            centroids.push(data[index]);
        }
    }
    return centroids;
}*/

const initializeCentroids = (data: [number, number, number][], k): [number, number, number][] => {
    const centroids: [number, number, number][] = [];
    centroids.push(data[Math.floor(Math.random() * data.length)]); // Первый центр выбирается случайно

    while (centroids.length < k) {
        const distances = data.map(point => 
            Math.min(...centroids.map(centroid => euclideanDistance(point, centroid)))
        );

        const totalDistance = distances.reduce((sum, d) => sum + d, 0);
        const probabilities = distances.map(d => d / totalDistance);

        let cumulativeProbability = 0;
        const randomValue = Math.random();
        for (let i = 0; i < probabilities.length; i++) {
            cumulativeProbability += probabilities[i];
            if (randomValue < cumulativeProbability) {
                centroids.push(data[i]);
                break;
            }
        }
    }

    return centroids;
};

// deprecated
const preBlurPixels = async (imgURL)=>{
    const blob   = (imgURL instanceof Blob || imgURL instanceof File) ? imgURL : (await fetch(imgURL)?.then?.((r)=>r?.blob?.()));
    const bitmap = await createImageBitmap(blob);
    const offset = new OffscreenCanvas(bitmap.width, bitmap.height);
    const ctx: any = offset.getContext("2d"); ctx.filter = "blur(16px)"; ctx?.drawImage?.(bitmap, 0, 0, offset.width, offset.height);
    return offset;
}

//
const getClusterImageData = async (imgURL)=>{
    //const blob   = (imgURL instanceof Blob || imgURL instanceof File) ? imgURL : (await fetch(imgURL)?.then?.((r)=>r?.blob?.()));
    const bitmap = await preBlurPixels(imgURL);//await createImageBitmap(blob);
    const offset = new OffscreenCanvas(bitmap.width * 0.125, bitmap.height * 0.125);
    const ctx: any = offset.getContext("2d");
    ctx?.drawImage?.(bitmap, 0, 0, offset.width, offset.height);

    //
    const img = ctx?.getImageData?.(0, 0, offset.width, offset.height, {
        storageFormat: "float32",
        colorSpace: "srgb"
    });

    //
    const data = img.data;
    const allCount = (offset.width*offset.height)||0;

    //
    const dv: number = 1 / 255;
    const fp32: any[] = [];
    for (let s=0;s<allCount;s++) {
        // TODO: more smart method for color selection
        const i4 = s*4;//Math.floor((s + Math.random()) / (samCount * allCount)), i4 = i*4;

        //
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
    return fp32;//sortColors(fp32);
}

// STEP-2 - get K-means by required counts
export const getDominantColors = async (imgURL: any)=>{
    const data = await getClusterImageData(imgURL);
    return sortColors(kMeans(data, 4), "h");
}
