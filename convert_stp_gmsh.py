import gmsh
import trimesh
import numpy as np
import os
import sys

def convert_stp_to_glb(stp_path, output_glb_path):
    print(f"[1] Initializing Gmsh C++ OpenCASCADE Engine...")
    gmsh.initialize()
    gmsh.option.setNumber("General.Terminal", 1)
    gmsh.option.setNumber("Mesh.CharacteristicLengthFactor", 1.0)
    # Set fine 2D surface triangulation for clean aerospace CAD surfaces
    gmsh.option.setNumber("Mesh.MeshSizeMin", 8.0)
    gmsh.option.setNumber("Mesh.MeshSizeMax", 45.0)
    gmsh.option.setNumber("Mesh.Algorithm", 6) # Frontal-Delaunay
    gmsh.option.setNumber("General.NumThreads", 8) # Multi-threaded

    print(f"[2] Loading STEP: {stp_path} ({os.path.getsize(stp_path)/(1024*1024):.1f} MB)...")
    gmsh.open(stp_path)

    print(f"[3] Extracting CAD volumes and surfaces from OpenCASCADE...")
    volumes = gmsh.model.getEntities(dim=3)
    surfaces = gmsh.model.getEntities(dim=2)
    print(f"    Found {len(volumes)} solid volumes and {len(surfaces)} CAD surface patches.")

    print(f"[4] Meshing 2D surface triangulation...")
    gmsh.model.mesh.generate(dim=2)

    # Get all nodes and elements
    node_tags, node_coords, _ = gmsh.model.mesh.getNodes()
    node_coords = np.array(node_coords).reshape(-1, 3)
    
    # Create tag-to-index mapping
    tag_map = {tag: i for i, tag in enumerate(node_tags)}

    scene = trimesh.Scene()
    
    # Extract surface components
    entities = volumes if len(volumes) > 0 else surfaces
    print(f"[5] Extracting {len(entities)} discrete CAD mesh components...")
    
    # Calculate overall centroid
    overall_min = node_coords.min(axis=0)
    overall_max = node_coords.max(axis=0)
    overall_center = (overall_min + overall_max) / 2.0
    overall_size = overall_max - overall_min
    print(f"    Overall CAD Bounding Box: Size={overall_size.round(1)}, Center={overall_center.round(1)}")

    # Center coordinates
    centered_coords = node_coords - overall_center

    part_count = 0
    for dim, tag in entities:
        elem_types, elem_tags, elem_node_tags = gmsh.model.mesh.getElements(dim=dim, tag=tag)
        
        tri_indices = []
        for e_type, e_nodes in zip(elem_types, elem_node_tags):
            if e_type == 2: # 3-node triangle
                tri_indices.extend(e_nodes)
            elif e_type == 3: # 4-node quad -> split to 2 triangles
                quads = np.array(e_nodes).reshape(-1, 4)
                for q in quads:
                    tri_indices.extend([q[0], q[1], q[2], q[0], q[2], q[3]])

        if len(tri_indices) == 0:
            continue

        # Convert gmsh node tags to array indices
        faces = [tag_map[t] for t in tri_indices]
        faces = np.array(faces).reshape(-1, 3)

        # Unique vertices for this part
        unique_nodes, inverse_indices = np.unique(faces, return_inverse=True)
        part_vertices = centered_coords[unique_nodes]
        part_faces = inverse_indices.reshape(-1, 3)

        part_mesh = trimesh.Trimesh(vertices=part_vertices, faces=part_faces, process=True)
        if len(part_mesh.faces) == 0:
            continue

        part_center = part_mesh.centroid
        explode_dir = part_center.copy()
        norm = np.linalg.norm(explode_dir)
        if norm > 0.001:
            explode_dir /= norm
        else:
            explode_dir = np.array([0.0, 1.0, 0.0])

        # Color palette for aerospace engine
        color_palette = [
            [61, 68, 81, 255],   # Crankcase Titanium
            [85, 98, 112, 255],  # Cylinder Heads Steel
            [122, 136, 155, 255],# Reduction Gearbox
            [136, 192, 208, 255],# Bing Carburetor Alloy
            [180, 142, 173, 255],# Exhaust Stainless Headers
            [46, 52, 64, 255],   # Chassis Mount Frame
            [153, 102, 51, 255], # Bronze Muffler
            [216, 222, 233, 255] # Propeller Flange Chrome
        ]
        chosen_color = color_palette[part_count % len(color_palette)]
        part_mesh.visual = trimesh.visual.ColorVisuals(mesh=part_mesh, face_colors=chosen_color)

        part_name = f"Rotax_STP_Component_{part_count + 1}"
        part_mesh.metadata['name'] = part_name
        part_mesh.metadata['explode_dir'] = explode_dir.tolist()
        part_mesh.metadata['centroid'] = part_center.tolist()

        scene.add_geometry(part_mesh, node_name=part_name)
        part_count += 1

    gmsh.finalize()

    print(f"[6] Exporting {part_count} discrete components to Binary GLB: {output_glb_path}...")
    glb_data = scene.export(file_type='glb')
    with open(output_glb_path, 'wb') as f:
        f.write(glb_data)
    
    file_mb = os.path.getsize(output_glb_path) / (1024 * 1024)
    print(f"[7] SUCCESS! Converted STP -> GLB ({file_mb:.2f} MB) with {part_count} exploded components!")

if __name__ == '__main__':
    stp_file = r"D:\MALE-UAV-DASHBOARD\dashboard\public\MOTEUR 912 + CHASSIS ROTAX.stp"
    out_glb = r"D:\MALE-UAV-DASHBOARD\dashboard\public\rotax_912_engine.glb"
    convert_stp_to_glb(stp_file, out_glb)
