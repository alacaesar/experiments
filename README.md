# Image Distortion Mesh

This experimens uses PaperJS to basically do this:

<img src="http://www.alacaesar.com/experiments/image-distortion-mesh/assets/preview.png" />

It creates a mesh of triangles *(Paths)* based on the provided image and applies the average color of the correspondant point in the *bitmap* to each triangle.

See it in action : <a href="http://www.alacaesar.com/experiments/image-distortion-mesh/" target="_blank">Demo</a>

##### Config params:
`size` : *(Integer)* the width of the result visual in pixels.

`resolution` : *(Integer)* the number of color points in the horizontal axis of the image.

`Noise` : *(Integer)* the max intensity of the distortion applied to each triangle in the mesh.

`pattern` : *(diamond, wave, diagonal)* determines the orientation of each triangle the mesh.


