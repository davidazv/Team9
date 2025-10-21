import { Controller, Post, UploadedFile, UseInterceptors, BadRequestException } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { join } from "path";
import { ApiTags, ApiOperation, ApiConsumes, ApiBody, ApiResponse } from "@nestjs/swagger";

@ApiTags('files')
@Controller("files")
export class FileController {
    @Post("upload")
    @ApiOperation({ summary: "Sube una imagen de evidencia para reportes" })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                file: {
                    type: 'string',
                    format: 'binary',
                    description: 'Imagen de evidencia (JPG, PNG, JPEG, WebP)',
                },
            },
        },
    })
    @ApiResponse({ 
        status: 201, 
        description: 'Imagen subida correctamente.',
        schema: {
            type: 'object',
            properties: {
                fileKey: { type: 'string', description: 'Nombre del archivo' },
                url: { type: 'string', description: 'URL completa del archivo' }
            }
        }
    })
    @ApiResponse({ status: 400, description: 'Archivo no válido o tipo no permitido.' })
    @UseInterceptors(FileInterceptor('file', {
        storage: diskStorage({
            destination: join(__dirname, "../../public/uploads"),
            filename: (req, file, cb) => {
                // Generar nombre único con timestamp
                const timestamp = Date.now();
                const randomNum = Math.floor(Math.random() * 1000);
                const extension = file.originalname.split('.').pop();
                const filename = `evidence_${timestamp}_${randomNum}.${extension}`;
                cb(null, filename);
            }
        }),
        fileFilter: (req, file, cb) => {
            // Solo permitir imágenes
            const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
            if (allowedMimes.includes(file.mimetype)) {
                cb(null, true);
            } else {
                cb(new Error('Solo se permiten archivos de imagen (JPG, PNG, WebP)'), false);
            }
        },
        limits: {
            fileSize: 5 * 1024 * 1024, // 5MB máximo
        }
    }))
    uploadFile(@UploadedFile() file: Express.Multer.File) {
        if (!file) {
            throw new BadRequestException('No se proporcionó ningún archivo');
        }
        
        return { 
            fileKey: file.filename,
            url: `http://localhost:3000/public/uploads/${file.filename}` 
        };
    }
}