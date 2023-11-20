(function() {

    const icon = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAeCAYAAAAy2w7YAAAABmJLR0QAwQCyADjD7uj0AAABhklEQVRIx71WvWqEQBD+XLS6IvgAyrXXBNKl8EhhZ+EjXBAsAwchT5D6CBzY3ztsYZcihEDqPII+gElxrabwJqeb3dzmdB2QAWd2vvnftXwnaDAB2QDwcPdqFGSTLVsgojqqBxlkOUMd1WA5+y0bC4RsEJgSaGgkpyKyReUxwJTNUD0abrzsAHTpfU7T3gCw3sdGALYz3gcKFyni4jQY99uD2rqFEBFRmbjKg96uOluXdQ/8dVCU6+oSZzL0MYlsMx3vhlAvIt3FqPpHXot89BUk1qNMXHkz0BIUhTqeqvQIlGyz7n4SayXzVAZCEYi8twNlEcl4uEh7EdG/rlFZ5GTb1kmDahPERQxojoY0daoUDrk+LN8Jmvv8BV/XlpE5unhv8BTdtKljOYObmxpZ61gjb1dNc02UiYvwOcVVeNubgXN3G3Ui9znK0AUyYamKMyDyTbbsfapB7TpLMst3gmY74+A+17rM/kNkc72Pj3M0f1vhY+T6zLECDu+RHyDTDxRrqkf+NzEM2H/0kdi/AAAAAElFTkSuQmCC`
    let lastToastNotif;

    Plugin.register("cceditor", {
		title: "CosmeticsCore Editor",
		author: "LoneDev",
		description: "Utility to easily edit and preview CosmeticsCore cosmetics.",
		icon: icon,
		version: "1.1.0",
		variant: "both",
        min_version: "4.6.4",
		onload: onload,
		onunload() {  },
		onuninstall() { }
	});

    function onload()
    {
        (function() {

            const CustomAction = (id, options) => {
                const action = new Action(id, options)
                // bus.on(events.LIFECYCLE.CLEANUP, action.delete.bind(action))
                return action
            }

            const menu = new BarMenu('CosmeticsCore', [], {
                condition: () => Project.format && Project.format.codec.id === 'java_block'
            })
            document.querySelector('#menu_bar').appendChild(menu.label)
            menu.label.innerHTML = "CosmeticsCore"
            let img = document.createElement('img')
            img.src = icon
            img.width = 16
            img.height = 16
            img.style.position = 'relative'
            img.style.top = '2px'
            img.style.marginRight = '5px'
            menu.label.prepend(img)

            function getDynamicMsg(dynamic) {
                if(isNormalModel()) {
                    return "This normal body cosmetic is compatible with Minecraft client 1.20.1 and lower. To create the model compatible with 1.20.2 (normal_2) open the CosmeticsCore menu and press on 'Create Model'."
                }
                else if(isNormalModel2()) {
                    return "This normal body cosmetic is compatible with Minecraft client 1.20.2 and greater.."
                }
                else if(isSelfModel()){
                    return "This self body cosmetic is compatible with Minecraft client 1.20.1 and lower. To create the model compatible with 1.20.2 (self_2) open the CosmeticsCore menu and press on 'Create Model'."
                } else if(isSelfModelNew()) {
                    return "This self body cosmetic is compatible with Minecraft client 1.20.2 and greater. To create the model compatible with 1.20.1 (self) open the CosmeticsCore menu and press on 'Create Model'."
                }
            }
            MenuBar.addAction(
                CustomAction({
                    icon: 'public',
                    category: 'CosmeticsCore',
                    name: "Normal body cosmetic | MC client 1.20.1 and lower",
                    id: 'body_cosmetic_info',
                    condition: () => isNormalModel(),
                    click: function () {
                        Blockbench.showMessageBox({
                            title: "Info",
                            message: getDynamicMsg()
                        });
                    },
                }),
                'CosmeticsCore'
            )
            MenuBar.addAction(
                CustomAction({
                    icon: 'public',
                    category: 'CosmeticsCore',
                    name: "Normal body cosmetic | MC client 1.20.2 and greater",
                    id: 'body_cosmetic_info',
                    condition: () => isNormalModel2(),
                    click: function () {
                        Blockbench.showMessageBox({
                            title: "Info",
                            message: getDynamicMsg()
                        });
                    },
                }),
                'CosmeticsCore'
            )
            MenuBar.addAction(
                CustomAction({
                    icon: 'camera-front',
                    category: 'CosmeticsCore',
                    name: "Self body cosmetic | MC client 1.20.1 and lower",
                    id: 'body_cosmetic_info',
                    condition: () => isSelfModel(),
                    click: function () {
                        Blockbench.showMessageBox({
                            title: "Info",
                            message: getDynamicMsg()
                        });
                    },
                }),
                'CosmeticsCore'
            )
            MenuBar.addAction(
                CustomAction({
                    icon: 'camera-front',
                    category: 'CosmeticsCore',
                    name: "Self body cosmetic | MC client 1.20.2 and greater",
                    id: 'body_cosmetic_info',
                    condition: () => isSelfModelNew(),
                    click: function () {
                        Blockbench.showMessageBox({
                            title: "Info",
                            message: getDynamicMsg()
                        });
                    },
                }),
                'CosmeticsCore'
            )
            MenuBar.addAction(
                new MenuSeparator('separator'),
                'CosmeticsCore'
            )
            MenuBar.addAction(
                CustomAction({
                    icon: 'checkroom',
                    category: 'CosmeticsCore',
                    name: "Preview",
                    id: 'preview_cosmetic',
                    condition: () => !isBodyCosmeticsViewSelected(),
                    click: function () {
                        bodyCosmeticPreview();
                    },
                }),
                'CosmeticsCore'
            )

            MenuBar.addAction(
                CustomAction({
                    icon: 'cancel',
                    category: 'CosmeticsCore',
                    name: "Exit Preview",
                    id: 'exit_cosmetic_preview',
                    condition: () => isBodyCosmeticsViewSelected(),
                    click: function () {
                        setBodyCosmeticsViewSelected(false)
                        lastToastNotif?.delete()
                    },
                }),
                'CosmeticsCore'
            )

            MenuBar.addAction(
                CustomAction({
                    icon: 'highlight_alt',
                    category: 'CosmeticsCore',
                    name: "Extend model position limits",
                    id: 'extend_model_position_limits',
                    click: function () {
                        askExtendModelPositionLimits()
                    },
                }),
                'CosmeticsCore'
            )
            
            function createNormalModel2 () {
                if(!Project.saved) {
                    Blockbench.showMessageBox({
                        title: "Error",
                        message: "Please save this model first."
                    });
                    return;
                }

                let suffix = "_normal_2"

                // If it's not already a self model
                if(!Project.export_path.match(/_normal_2\.json/g)) {
                    let origPath = Project.export_path
                    let origName = Project.name
                    // Temporary change export path of the current project in order to export it to a new file.
                    let selfPath = Project.export_path.replace(".json", suffix + ".json")
                    Project.export_path = selfPath
                    // Do export
                    // NOTE: file name might have been changed by the user using the save file dialog, careful.
                    Project.format.codec.export()

                    // Restore original name for this project
                    Project.export_path = origPath
                    Project.name = origName

                    // Load the just saved self model in a new tab.
                    // WARNING: it's unreliable: if the user pressed CANCEL during name selection and the file already exists
                    // It will open that file even if it's not our new created file (since none was created).
                    Blockbench.read([selfPath],{
                        resource_id: 'model',
                        extensions: Codec.getAllExtensions(),
                        type: 'Model',
                    }, function(files) {
                        if(files.length === 1) {
                            loadModelFile(files[0]);

                            Blockbench.showMessageBox({
                                title: "Success",
                                message: "Successfully generated normal model. You can now edit its preview position to make it look correctly placed."
                            });

                            setTimeout(function() {
                                bodyCosmeticPreview();
                            }, 1500);

                        } else {
                            Blockbench.showMessageBox({
                                title: "Error",
                                message: "Please save the self model as required."
                            });
                        }
                    })
                }
            }
            
            function createSelfModel (isNewSelfBody) {
                if(!Project.saved) {
                    Blockbench.showMessageBox({
                        title: "Error",
                        message: "Please save this model first."
                    });
                    return;
                }

                let suffix = isNewSelfBody ? "_self_2" : "_self"

                // If it's not already a self model
                if(!Project.export_path.match(/_self(|_self_2).json/g)) {
                    let origPath = Project.export_path
                    let origName = Project.name
                    // Temporary change export path of the current project in order to export it to a new file.
                    let selfPath = Project.export_path.replace(".json", suffix + ".json")
                    Project.export_path = selfPath
                    // Do export
                    // NOTE: file name might have been changed by the user using the save file dialog, careful.
                    Project.format.codec.export()

                    // Restore original name for this project
                    Project.export_path = origPath
                    Project.name = origName

                    // Load the just saved self model in a new tab.
                    // WARNING: it's unreliable: if the user pressed CANCEL during name selection and the file already exists
                    // It will open that file even if it's not our new created file (since none was created).
                    Blockbench.read([selfPath],{
                        resource_id: 'model',
                        extensions: Codec.getAllExtensions(),
                        type: 'Model',
                    }, function(files) {
                        if(files.length === 1) {
                            loadModelFile(files[0]);

                            Blockbench.showMessageBox({
                                title: "Success",
                                message: "Successfully generated self model. You can now edit its preview position to make it look correctly placed."
                            });

                            setTimeout(function() {
                                bodyCosmeticPreview();
                            }, 1500);

                        } else {
                            Blockbench.showMessageBox({
                                title: "Error",
                                message: "Please save the self model as required."
                            });
                        }
                    })
                }
            }
            MenuBar.addAction(
                CustomAction({
                    icon: 'person_add_alt',
                    category: 'CosmeticsCore',
                    name: "Create Model",
                    id: 'create_model',
                    condition: () => !isAnySelfModel() && !isNormalModel2(),
                    children() {
                        return [
                            CustomAction({
                                icon: 'arrow_forward',
                                category: 'CosmeticsCore',
                                name: "Normal - MC 1.20.2 and greater (normal_2)",
                                id: 'create_normal_model_2',
                                condition: () => !isAnySelfModel(),
                                click: () => createNormalModel2(),
                            }),
                            new MenuSeparator('separator'),
                            CustomAction({
                                icon: 'arrow_back',
                                category: 'CosmeticsCore',
                                name: "Self - MC 1.20.1 and lower (self)",
                                id: 'create_self_model_1',
                                condition: () => !isAnySelfModel(),
                                click: () => createSelfModel(),
                            }),
                            CustomAction({
                                icon: 'arrow_forward',
                                category: 'CosmeticsCore',
                                name: "Self - MC 1.20.1 and greater (self_2)",
                                id: 'create_self_model_2',
                                condition: () => !isAnySelfModel(),
                                click: () => createSelfModel(true),
                            })
                        ]
                    }
                }),
                'CosmeticsCore'
            )


            MenuBar.update()

            const display_angle_preset = {
                projection: 'perspective',
                position: [-108, 20, 83],
                rotation: [2, 125, -1.13],
                target: [0, 8, 0]
            }
            let prevSelectedMode;

            // Inject behaviour
            const orig_updateDisplayBase = DisplayMode.updateDisplayBase
            DisplayMode.updateDisplayBase = function(slot) {

                if(isBodyCosmeticsViewSelected()) {
                    updateDisplayBasebody_cosmetic();
                    return;
                }

                orig_updateDisplayBase(slot)
            }

            // Inject behaviour
            const orig_DisplayMode_load = DisplayMode.load
            DisplayMode.load = function (slot) {
                orig_DisplayMode_load();
                switch (slot) {
                    case 'body_cosmetic':
                        DisplayMode.loadbody_cosmetic()
                        break;
                }
            }

            DisplayMode.loadbody_cosmetic = function() {		//Loader
                loadDispbody_cosmetic('head')

                // Change model to player
                window.displayReferenceObjects.bar(['player'])

                // Set camera rotation and position
                display_preview.loadAnglePreset(display_angle_preset)
            }

            removeTool("body_cosmetic")
            $("#display_bar").append(
                $(`<input class="hidden" type="radio" name="display" id="body_cosmetic" >
                    <label class="hidden" for="body_cosmetic" onclick="DisplayMode.loadbody_cosmetic()"><div class="tooltip">Body Cosmetic</div></label>`
                )
            );

            $("#head").click(function () {
                orig_updateDisplayBase();
            });

            $("#mode_selector li").click(function(e) {
                if (e.button === 0) {
                    if(!Modes.options.display.selected) {
                        lastToastNotif?.delete()
                        setBodyCosmeticsViewSelected(false)
                    }
                }
            });

            function isNormalModel() {
                return !isNormalModel2() && !isAnySelfModel();
            }

            function isNormalModel2() {
                if(!Project.name)
                    return false;
                if(isAnySelfModel()) {
                    return false;
                }
                return Project.name.endsWith("_normal_2");
            }

            function isAnySelfModel() {
                if(!Project.name)
                    return false;
                return Project.name.endsWith("_self") || Project.name.endsWith("_self_2");
            }

            function isSelfModel() {
                if(!Project.name)
                    return false;
                return Project.name.endsWith("_self");
            }

            function isSelfModelNew() {
                if(!Project.name)
                    return false;
                return Project.name.endsWith("_self_2");
            }

            function removeTool(toolId) {
                $(`#${toolId}`).remove();
                $(`label[for=${toolId}]`).remove();
            }

            function isBodyCosmeticsViewSelected() {
                return Modes.options.display.selected && $("#body_cosmetic").is(":checked")
            }

            function setBodyCosmeticsViewSelected(show) {
                if(show) {
                    prevSelectedMode = Modes.selected
                    if(!Modes.options.display.selected) {
                        Modes.options.display.select()
                    }
                    $("#body_cosmetic").trigger("click");
                    DisplayMode.loadbody_cosmetic()

                    // Hide various preview types panel
                    $("#display_bar").hide()
                    $("#display_bar").prev("p").hide()

                    // Hide head pose
                    $("#display_sliders").children().slice(-2).hide()

                    // Make sure the head preview is reset to avoid showing the cosmetic in the wrong rotation.
                    displayReferenceObjects.active.pose_angles["head"] = 0;
                    if (displayReferenceObjects.active.updateBasePosition)
                        displayReferenceObjects.active.updateBasePosition();

                    setTimeout(function () {
                        fixGizmoPreviewCosmetic()
                    }, 200)
                } else {
                    Modes.options.display.select()

                    // First tab
                    $("#thirdperson_righthand").trigger("click");
                    DisplayMode.loadThirdRight()

                    // Hide various preview types panel
                    $("#display_bar").show()
                    $("#display_bar").prev("p").show()

                    // Show head pose
                    $("#display_sliders").children().slice(-2).show()

                    // Restore original selected tab
                    if(prevSelectedMode == null)
                        prevSelectedMode = Modes.options.edit
                    prevSelectedMode.select()
                }
            }

            function getHeadData() {
                if(!Project.display_settings["head"]) {
                    Project.display_settings["head"] = new DisplaySlot();
                    //DisplayMode.updateDisplayBase();
                }
                return Project.display_settings["head"];
            }

            function loadDispbody_cosmetic(key) {	//Loads The Menu and slider values, common for all Radio Buttons
                display_slot = key

                display_preview.controls.enabled = true;
                ground_animation = false;
                $('#display_crosshair').detach()
                if (display_preview.orbit_gizmo) display_preview.orbit_gizmo.unhide();
                display_preview.camPers.setFocalLength(45)

                if (Project.display_settings[key] == undefined) {
                    Project.display_settings[key] = new DisplaySlot()
                }
                display_preview.force_locked_angle = false;
                DisplayMode.vue._data.slot = Project.display_settings[key]
                DisplayMode.slot = Project.display_settings[key]
                updateDisplayBasebody_cosmetic();
                Canvas.updateRenderSides();
                DisplayMode.updateGUILight();
                Toolbars.display.update();
            }

            const updateDisplayBasebody_cosmetic = function() {
                slot = getHeadData()

                display_base.rotation.x = Math.PI / (180 / slot.rotation[0]);
                display_base.rotation.y = Math.PI / (180 / slot.rotation[1]) * (display_slot.includes('lefthand') ? -1 : 1);
                display_base.rotation.z = Math.PI / (180 / slot.rotation[2]) * (display_slot.includes('lefthand') ? -1 : 1);

                display_base.position.x = slot.translation[0] * (display_slot.includes('lefthand') ? -1 : 1);
                display_base.position.y = slot.translation[1];
                display_base.position.z = slot.translation[2];

                display_base.scale.x = (slot.scale[0]||0.001) * (slot.mirror[0] ? -1 : 1);
                display_base.scale.y = (slot.scale[1]||0.001) * (slot.mirror[1] ? -1 : 1);
                display_base.scale.z = (slot.scale[2]||0.001) * (slot.mirror[2] ? -1 : 1);

                //Transformer.center()
                let offset = 0;
                if(isSelfModelNew()) {
                    offset = 97.5;
                } else if(isSelfModel()) {
                    offset = 95;
                } else if(isNormalModel2()) {
                    offset = 35 + 10.75;
                } else if(isNormalModel()) {
                    offset = 35;
                }

                display_base.position.y = slot.translation[1] + offset;

                // Temporary hack to keep the gizmo in the center of the back
                fixGizmoPreviewCosmetic()
            }

            function bodyCosmeticPreview() {
                setBodyCosmeticsViewSelected(true)

                lastToastNotif?.delete()
                if(isSelfModel()) {
                    lastToastNotif = Blockbench.showToastNotification({
                        text: `Preview of self cosmetic model.`,
                        expire: 30000
                    });
                } else if(isSelfModelNew()) {
                    lastToastNotif = Blockbench.showToastNotification({
                        text: `Preview of self_2 cosmetic model.`,
                        expire: 30000
                    });
                } else if(isNormalModel()) {
                    lastToastNotif = Blockbench.showToastNotification({
                        text: `Preview of normal cosmetic model.`,
                        expire: 30000
                    });
                } else if(isNormalModel2()) {
                    lastToastNotif = Blockbench.showToastNotification({
                        text: `Preview of normal_2 cosmetic model.`,
                        expire: 30000
                    });
                }
            }

            function extendModelPositionLimits() {
                let headData = getHeadData();
                if(new Set(headData.scale).size === 1) {

                    if(headData.scale[0] * 2 > 4) {
                        Blockbench.showMessageBox({
                            title: "Error",
                            message: "Error! Cannot scale the model down more than this!"
                        });
                        return;
                    }

                    Modes.options.display.select()

                    scale(0.5)

                    // Move the WHOLE model down in the editor mode
                    moveAllDownUntilLimit()

                    // Scale the "head" display x2
                    headData.scale[0] *= 2;
                    headData.scale[1] *= 2;
                    headData.scale[2] *= 2;

                    Modes.options.display.select()

                    Project.saved = false

                    setBodyCosmeticsViewSelected(true)

                    Blockbench.showMessageBox({
                        title: "Done",
                        message: `Automatically attempted to fix model to allow moving it down further more.`
                    });

                } else {
                    Blockbench.showMessageBox({
                        title: "Error",
                        message: "ERROR! Please set size to the same value for each scale property of the body cosmetic preview! Do not use different values."
                    });
                }
            }

            function selectAll() {
                // Select all
                Outliner.selected.length = 0
                Cube.all.forEach(function (cube) {
                    Outliner.selected.push(cube)
                })
            }

            function moveAllDownUntilLimit() {
                selectAll()

                for (let i = 0; i > -64; i-=0.5) {
                    moveAllDown(i)
                }
            }

            // Took from Blockbench transform_gizmo.js
            // https://github.com/JannisX11/blockbench/blob/e84495569f82a8c78fa4d47c6099a78eadafcb9a/js/modeling/transform_gizmo.js#L1229
            function moveAllDown(difference) {
                let axis = 1

                var overlapping = false
                if (Format.cube_size_limiter && !settings.deactivate_size_limit.value) {
                    Cube.selected.forEach(function(obj) {
                        let from = obj.from.slice();
                        let to = obj.to.slice();
                        from[axis] += difference;
                        to[axis] += difference;
                        overlapping = overlapping || Format.cube_size_limiter.test(obj, {from, to});
                    })
                }
                if (!overlapping) {
                    moveElementsInSpace(difference, axis)

                    updateSelection()
                }
            }

            function scale(size) {
                if (Outliner.selected.length == 0) {
                    Prop.active_panel = 'preview';
                    selectAll();
                }

                Undo.initEdit({elements: Outliner.selected, outliner: Format.bone_rig});

                Outliner.selected.forEach((obj) => {
                    obj.before = {
                        from: obj.from ? obj.from.slice() : undefined,
                        to: obj.to ? obj.to.slice() : undefined,
                        origin: obj.origin ? obj.origin.slice() : undefined
                    }
                    if (obj instanceof Mesh) {
                        obj.before.vertices = {};
                        for (let key in obj.vertices) {
                            obj.before.vertices[key] = obj.vertices[key].slice();
                        }
                    }
                })
                ModelScaler.getScaleGroups().forEach((g) => {
                    g.old_origin = g.origin.slice();
                }, Group, true)

                ModelScaler.dialog.show();

                ModelScaler.overflow = null;
                let v = Format.centered_grid ? 0 : 8;
                let origin = Group.selected ? Group.selected.origin : [v, 0, v];
                ModelScaler.dialog.setFormValues({
                    origin,
                    scale: size
                });

                ModelScaler.dialog.confirm();
            }

            function askExtendModelPositionLimits() {

                if(getHeadData().translation[1] > -80) {
                    Blockbench.showMessageBox({
                        title: "Info",
                        message:"No need to do that. Your model is not on the side of any of the model bounding box.",
                        icon: 'info',
                    });
                    return;
                }

                Blockbench.showMessageBox({
                    title: "⚠️Warning",
                    message:"Please make a backup before accepting.\n\nDo you want to automatically fix the model to allow moving it up/down further more?",
                    icon: 'error',
                    buttons: ["⚠️Confirm⚠️", "Cancel"],
                    confirm: 0,
                    cancel: 1, // By default also used by the X button of the title bar.
                }, function(i) {
                    if(i === 0) {
                        extendModelPositionLimits()
                    }
                });
            }

            function fixGizmoPreviewCosmetic() {
                if(isBodyCosmeticsViewSelected()) {
                    Transformer.position.y = 15;
                    Transformer.position.z = 2;
                }
            }

            // Shit to fix the location of the Gizmo on any other event.
            setInterval(fixGizmoPreviewCosmetic, 1000);

            Blockbench.on('undo', (event) => {
                // Shit to fix the location of the Gizmo on undo.
                fixGizmoPreviewCosmetic()
            });

        })()
    }

})();