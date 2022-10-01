(function() {

    const icon = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAeCAYAAAAy2w7YAAAABmJLR0QAwQCyADjD7uj0AAABhklEQVRIx71WvWqEQBD+XLS6IvgAyrXXBNKl8EhhZ+EjXBAsAwchT5D6CBzY3ztsYZcihEDqPII+gElxrabwJqeb3dzmdB2QAWd2vvnftXwnaDAB2QDwcPdqFGSTLVsgojqqBxlkOUMd1WA5+y0bC4RsEJgSaGgkpyKyReUxwJTNUD0abrzsAHTpfU7T3gCw3sdGALYz3gcKFyni4jQY99uD2rqFEBFRmbjKg96uOluXdQ/8dVCU6+oSZzL0MYlsMx3vhlAvIt3FqPpHXot89BUk1qNMXHkz0BIUhTqeqvQIlGyz7n4SayXzVAZCEYi8twNlEcl4uEh7EdG/rlFZ5GTb1kmDahPERQxojoY0daoUDrk+LN8Jmvv8BV/XlpE5unhv8BTdtKljOYObmxpZ61gjb1dNc02UiYvwOcVVeNubgXN3G3Ui9znK0AUyYamKMyDyTbbsfapB7TpLMst3gmY74+A+17rM/kNkc72Pj3M0f1vhY+T6zLECDu+RHyDTDxRrqkf+NzEM2H/0kdi/AAAAAElFTkSuQmCC`
    let lastToastNotif;

    Plugin.register("cceditor", {
		title: "CosmeticsCore Editor",
		author: "LoneDev",
		description: "Utility to easily preview cosmetics.",
		icon: icon,
		version: "1.0.0-beta2",
		variant: "both",
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

            MenuBar.addAction(
                CustomAction({
                    icon: 'checkroom',
                    category: 'CosmeticsCore',
                    name: "Body Cosmetic Preview",
                    id: 'body_cosmetic_preview',
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
                    name: "Exit Body Cosmetic Preview",
                    id: 'exit_body_cosmetic_preview',
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
                    icon: 'auto_fix_high',
                    category: 'CosmeticsCore',
                    name: "Auto fix self model",
                    id: 'auto_fix_self_model',
                    condition: () => isSelfModel(),
                    click: function () {
                        autoFixSelfModel()
                    },
                }),
                'CosmeticsCore'
            )
            MenuBar.addAction(
                CustomAction({
                    icon: 'auto_fix_high',
                    category: 'CosmeticsCore',
                    name: "Create Self Model",
                    id: 'create_self_model',
                    condition: () => !isSelfModel(),
                    click: function () {

                        if(!Project.saved) {
                            Blockbench.showMessageBox({
                                title: "Error",
                                message: "Please save this model first."
                            });
                            return;
                        }

                        if(!Project.export_path.endsWith("_self.json")) {
                            let selfPath = Project.export_path.replace(".json", "_self.json")
                            Project.export_path = selfPath
                            Project.format.codec.export()

                            Project.export_path = Project.export_path.replace("_self.json", ".json")
                            Project.name = Project.name.replace("_self", "")

                            // Load the self model in a new tab
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

                    },
                }),
                'CosmeticsCore'
            )
            MenuBar.update()


            const display_angle_preset = {
                projection: 'perspective',
                position: [-200, 40, -200],
                target: [0, 8, 0],
                default: true
            }

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
                display_preview.camPers.position.set(-44, 40, -44)
                display_preview.controls.target.set(0, 14, 0)
                display_preview.loadAnglePreset({
                    position: [-44, 40, -44],
                    target: [0, 14, 0]
                })
                window.displayReferenceObjects.bar(['player'])

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

            function isSelfModel() {
                if(!Project.name)
                    return false;
                return Project.name.endsWith("self");
            }

            function removeTool(toolId) {
                $(`#${toolId}`).remove();
                $(`label[for=${toolId}]`).remove();
            }

            function isBodyCosmeticsViewSelected() {
                return $("#body_cosmetic").is(":checked")
            }

            function setBodyCosmeticsViewSelected(show) {
                if(show && !Modes.options.display.selected) {
                    Modes.options.display.select()
                }
                if(show) {
                    $("#body_cosmetic").trigger("click");
                    DisplayMode.loadbody_cosmetic()

                    // Hide various preview types panel
                    $("#display_bar").hide()
                    $("#display_bar").prev("p").hide()

                    // Hide head pose
                    $("#display_sliders").children().slice(-2).hide()
                } else {

                    let newSelectedMode = Modes.selected

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
                    newSelectedMode.select()
                }
            }

            function getHeadData() {
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

                Transformer.center()

                display_base.position.y = slot.translation[1] + (isSelfModel() ? 95 : 35); // Self / Global model offset
            }

            function bodyCosmeticPreview() {
                setBodyCosmeticsViewSelected(true)

                lastToastNotif?.delete()
                if(isSelfModel()) {
                    lastToastNotif = Blockbench.showToastNotification({
                        text: `This is a SELF cosmetic model.\n(If you want to edit the GLOBAL model: create a new file and rename it to '${Project.name.replaceAll("_self", "")}.json')`,
                        expire: 30000
                    });
                } else  {
                    lastToastNotif = Blockbench.showToastNotification({
                        text: `This is a GLOBAL cosmetic model.\n(If you want to edit the SELF model: create a new file and rename it to '${Project.name}_self.json')`,
                        expire: 30000
                    });
                }
            }

            function selfModelScaleDown() {
                let headData = getHeadData();
                if(new Set(headData.scale).size === 1) {

                    if(headData.scale[0] * 2 > 4) {
                        Blockbench.showMessageBox({
                            title: "Error",
                            message: "Error! Cannot scale the model up more than this!"
                        });
                        return;
                    }

                    Modes.options.edit.select()

                    scaleModel(0.5)

                    // Move the WHOLE model down in the editor mode
                    moveAllDownUntilLimit()


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

            function scaleModel(scale) {

                selectAll()

                Undo.initEdit({elements: Outliner.selected, outliner: Format.bone_rig})

                Outliner.selected.forEach(function(obj) {
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
                getScaleAllGroups().forEach((g) => {
                    g.old_origin = g.origin.slice();
                }, Group, true)
                var v = Format.centered_grid ? 0 : 8;
                var origin = Group.selected ? Group.selected.origin : [v, 0, v];
                $('#scaling_origin_x').val(origin[0])
                $('#scaling_origin_y').val(origin[1])
                $('#scaling_origin_z').val(origin[2])
                scaleAll(false, scale)
            }

            function autoFixSelfModel() {

                Blockbench.showMessageBox({
                    title: "WARNING!",
                    message:"DO NOT USE THIS FEATURE MULTIPLE TIMES FOR THE SAME MODEL! ONE TIME IS ENOUGH!\n\nPlease make a backup before accepting.\n\nDo you want to automatically fix the model to allow moving it up/down further more?",
                    icon: 'error',
                    buttons: ["NO", "YES"],
                    cancel: 0,
                    confirm: 1
                }, function(i) {
                    if(i === 1) {
                        selfModelScaleDown()
                    }
                });
            }

        })()
    }

})();