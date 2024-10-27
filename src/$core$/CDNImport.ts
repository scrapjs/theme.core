export const importTimeout = async (url, timeout = 1000) => {
    return Promise.race([
        import(url),
        new Promise((_, rj) => (setTimeout(rj, timeout)))
    ]);
}

//
export default async (cdnList, local, whoFast = false)=>{
    let module = null;

    //
    const timeout = 1000;
    if (whoFast) {
        try { module = await Promise.any(cdnList.map(m=>importTimeout(/* webpackIgnore: true */ m, timeout))); } catch(e) { console.warn(e); }
    } else {
        for (let m of cdnList) {
            try { module = await importTimeout(/* webpackIgnore: true */ m, timeout); } catch(e) { console.warn(e); }
            if (module != null) { return module; }
        }

        //
        if (module != null) { return module; }
    }

    switch(typeof local) {
        case "string":
            return importTimeout(/* webpackIgnore: true */ local, timeout)
        case "function":
            return local();
        default:
            return local;
    }
}
