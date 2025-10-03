/* eslint-disable prettier/prettier */

// import { Controller,Post, UploadedFile, UseInterceptors } from "@nestjs/common";
// import { FileInterceptor } from "@nestjs/platform-express";
// import { diskStorage } from "multer";
// import { join } from "path";

// @Controller("files")
// export class FileController {
//     @Post("upload")
//     @UseInterceptors(FileInterceptor('file', {
//         storage: diskStorage({
//             destination: join(__dirname, "../../public/uploads"),
//             filename: (req, file, cb) => {
//                 const name= file.originalname.replace(" ","");
//                 cb(null,name)
//             }
//         })
//     }))
//     uploadFile(@UploadedFile() file: Express.Multer.File) {
//         return { fileKey: ` ${file.filename}`,
//          url: `http://localhost:3000/public/uploads/${file.filename}` };
//     }
// }

import { Controller, Post, UploadedFile, UseInterceptors } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { join } from "path";
import { ApiTags, ApiOperation, ApiConsumes, ApiBody, ApiResponse } from "@nestjs/swagger";

@ApiTags('files')
@Controller("files")
export class FileController {
    @Post("upload")
    @ApiOperation({ summary: "Sube un archivo" })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                file: {
                    type: 'string',
                    format: 'binary',
                },
            },
        },
    })
    @ApiResponse({ status: 201, description: 'Archivo subido correctamente.' })
    @UseInterceptors(FileInterceptor('file', {
        storage: diskStorage({
            destination: join(__dirname, "../../public/uploads"),
            filename: (req, file, cb) => {
                const name= file.originalname.replace(" ","");
                cb(null,name)
            }
        })
    }))
    uploadFile(@UploadedFile() file: Express.Multer.File) {
        return { fileKey: ` ${file.filename}`,
         url: `http://localhost:3000/public/uploads/${file.filename}` };
    }
}