declare namespace PE {
    function load(buffer: ArrayBuffer): Image | null;

    interface Image {
        dosHeader: IMAGE_DOS_HEADER;
    }

    interface IMAGE_DOS_HEADER {
        /* WORD     */ e_magic: number;
        /* WORD     */ e_cblp: number;
        /* WORD     */ e_cp: number;
        /* WORD     */ e_crlc: number;
        /* WORD     */ e_cparhdr: number;
        /* WORD     */ e_minalloc: number;
        /* WORD     */ e_maxalloc: number;
        /* WORD     */ e_ss: number;
        /* WORD     */ e_sp: number;
        /* WORD     */ e_csum: number;
        /* WORD     */ e_ip: number;
        /* WORD     */ e_cs: number;
        /* WORD     */ e_lfarlc: number;
        /* WORD     */ e_ovno: number;
        /* WORD[4]  */ e_res: Uint16Array;
        /* WORD     */ e_oemid: number;
        /* WORD     */ e_oeminfo: number;
        /* WORD[10] */ e_res2: Uint16Array;
        /* LONG     */ e_lfanew: number;
    }

    const IMAGE_DOS_SIGNATURE: number;
    const IMAGE_NT_SIGNATURE: number;
}