import io
from PIL import Image
import base64
from fastapi import FastAPI
from pydantic import BaseModel


from transformers import TrOCRProcessor, VisionEncoderDecoderModel
from PIL import Image, ImageFilter

import torch

device = torch.device("cpu")

processor = TrOCRProcessor.from_pretrained("microsoft/trocr-small-printed")
model = VisionEncoderDecoderModel.from_pretrained("microsoft/trocr-small-printed").to(
    device
)


def ocr(image, processor, model, device):
    pixel_values = processor(image, return_tensors="pt").pixel_values.to(device)
    generated_ids = model.generate(pixel_values)
    generated_text = processor.batch_decode(generated_ids, skip_special_tokens=True)[0]
    return generated_text


app = FastAPI()


class Image64(BaseModel):
    image: str


@app.get("/")
async def root():
    return {"message": "Hello World"}


@app.post("/api/analyse")
async def analyse(image: Image64):
    # print(image.image[22:])
    image_string = io.BytesIO(base64.b64decode(image.image[22:]))
    print(image_string)
    image_string.seek(0)
    pil_image = Image.open(image_string)
    new_image = Image.new(
        "RGBA", pil_image.size, "WHITE"
    )  # Create a white rgba background
    new_image.paste(pil_image, (0, 0), pil_image)

    pil_image = new_image.convert("RGB")
    # pil_image = pil_image.filter(ImageFilter.GaussianBlur(radius=5))
    pil_image.save("test.png")
    text = ocr(pil_image, processor, model, device)
    print(text)
    return {"result": text}
