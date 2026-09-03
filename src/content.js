export const APP_TITLE = 'Starting Geodynamic Earth Models';

export const INFO_PANEL_HEADING =
  'Quantifying plate driving forces in global models of mantle convection with realistic surface topography';

export const INFO_PANEL_BODY_HTML = `
  <p>
    High-resolution global mantle flow models can be used to investigate
    fundamental questions on plate tectonics, such as what drives plate
    motions relative to each other, how stresses are transferred from the
    mantle to the overlying plates, and how that affects deformation within
    the plate interior. We, therefore, develop compressible global mantle
    flow models that include heterogeneities from the surface to the
    core-mantle boundary to simulate real-Earth plate forces. Our models are
    based on the following inputs:
  </p>
  <h3>Topography</h3>
  <p>
    The surface elevation data at 0.25 deg spacing in the latitude-longitude
    grid and smoothed using inverse distance weights over 1000 km distance
    from a given point.
  </p>
  <h3>Slab structures</h3>
  <p>
    Slab2 database (Hayes et al., 2018) that describes the three dimensional
    geometries of all the seismically active subduction zones on Earth.
  </p>
  <h3>Lithospheric structure</h3>
  <p>
    The depths to the base of lithosphere from Priestley, McKenzie, &amp; Ho,
    2018.
  </p>
  <h3>Uppermost mantle structure</h3>
  <p>
    Modified TM1 model by Osei Tutu, Sobolev, et al., 2018 such that it
    includes half-space cooling model for oceanic lithosphere and varying
    ages for continental lithosphere from surface until 200 km depth, but no
    slabs.
  </p>
  <h3>Lower mantle structure</h3>
  <p>
    Joint P- and S-wave 1&deg; tomography model LLNL-G3D-JPS by Simmons et
    al., 2019 below 200 km such that positive seismic anomalies are excluded
    from the upper mantle.
  </p>
  <p>
    This website was made by Arushi Saxena and Timo Heister.
  </p>
  <ul class="info-panel__links">
    <li><a href="https://alarshi.github.io/" target="_blank" rel="noopener noreferrer">Arushi Saxena</a></li>
    <li><a href="https://www.math.clemson.edu/~heister/" target="_blank" rel="noopener noreferrer">Timo Heister</a></li>
    <li><a href="https://integrated-earth.github.io/" target="_blank" rel="noopener noreferrer">Integrated Earth — NSF-sponsored project</a></li>
    <li><a href="https://kitware.github.io/vtk-js/" target="_blank" rel="noopener noreferrer">VTK.js documentation</a></li>
    <li><a href="https://github.com/tjhei/vrkjs-test" target="_blank" rel="noopener noreferrer">This project</a></li>
  </ul>
`;
