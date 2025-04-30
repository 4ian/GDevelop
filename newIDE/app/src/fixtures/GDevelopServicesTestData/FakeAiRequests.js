export const agentAiRequest = {
  id: '01JT3FTKKTTR99BW00PW7VA0TS',
  createdAt: '2025-04-30T13:57:49.818Z',
  updatedAt: '2025-04-30T14:01:41.683Z',
  status: 'ready',
  userId: 'wWP8BSlAW0UP4NeaHa2LcmmDzmH2',
  output: [
    {
      role: 'user',
      type: 'message',
      content: [
        {
          type: 'user_request',
          status: 'completed',
          text: 'Make a super mario game',
        },
      ],
      status: 'completed',
    },
    {
      role: 'assistant',
      type: 'message',
      content: [
        {
          name: 'create_scene',
          arguments: '{"scene_name":"Level1"}',
          type: 'function_call',
          status: 'completed',
          call_id: 'tool_0_create_scene',
        },
      ],
      status: 'completed',
    },
    {
      type: 'function_call_output',
      output: '{"success":true,"message":"Created new scene \\"Level1\\"."}',
      call_id: 'tool_0_create_scene',
    },
    {
      role: 'assistant',
      type: 'message',
      content: [
        {
          annotations: [],
          text:
            'I have created a scene called `Level1`. Now I will create Mario and add the `PlatformerObjectBehavior` to him.',
          type: 'output_text',
          status: 'completed',
        },
      ],
      status: 'completed',
    },
    {
      role: 'assistant',
      type: 'message',
      content: [
        {
          name: 'create_object',
          arguments:
            '{"object_type":"Sprite","object_name":"Mario","description":"Mario character","scene_name":"Level1"}',
          type: 'function_call',
          status: 'completed',
          call_id: 'tool_0_create_object',
        },
      ],
      status: 'completed',
    },
    {
      type: 'function_call_output',
      output:
        '{"success":true,"message":"Created object \\"Mario\\" of type \\"Sprite\\" in scene \\"Level1\\"."}',
      call_id: 'tool_0_create_object',
    },
    {
      role: 'assistant',
      type: 'message',
      content: [
        {
          annotations: [],
          text:
            'I have created the [Sprite](object_type:Sprite) object `Mario`. Now I will add the [PlatformBehavior::PlatformerObjectBehavior](behavior_type:PlatformBehavior::PlatformerObjectBehavior) to it so it can move and jump.',
          type: 'output_text',
          status: 'completed',
        },
      ],
      status: 'completed',
    },
    {
      role: 'assistant',
      type: 'message',
      content: [
        {
          name: 'add_behavior',
          arguments:
            '{"behavior_type":"PlatformBehavior::PlatformerObjectBehavior","object_name":"Mario","scene_name":"Level1","behavior_name":"PlatformerObject"}',
          type: 'function_call',
          status: 'completed',
          call_id: 'tool_0_add_behavior',
        },
      ],
      status: 'completed',
    },
    {
      type: 'function_call_output',
      output:
        '{"success":true,"message":"Added behavior \\"PlatformerObject\\" of type \\"PlatformBehavior::PlatformerObjectBehavior\\" to object \\"Mario\\"."}',
      call_id: 'tool_0_add_behavior',
    },
    {
      role: 'assistant',
      type: 'message',
      content: [
        {
          annotations: [],
          text:
            'I have added the [PlatformBehavior::PlatformerObjectBehavior](behavior_type:PlatformBehavior::PlatformerObjectBehavior) to the object `Mario`. Now I will create the ground and add the [PlatformBehavior::PlatformBehavior](behavior_type:PlatformBehavior::PlatformBehavior) to it.',
          type: 'output_text',
          status: 'completed',
        },
      ],
      status: 'completed',
    },
    {
      role: 'assistant',
      type: 'message',
      content: [
        {
          name: 'create_object',
          arguments:
            '{"object_type":"TiledSpriteObject::TiledSprite","object_name":"Ground","description":"Ground for the level","scene_name":"Level1"}',
          type: 'function_call',
          status: 'completed',
          call_id: 'tool_0_create_object',
        },
      ],
      status: 'completed',
    },
    {
      type: 'function_call_output',
      output:
        '{"success":true,"message":"Created object \\"Ground\\" of type \\"TiledSpriteObject::TiledSprite\\" in scene \\"Level1\\"."}',
      call_id: 'tool_0_create_object',
    },
    {
      role: 'assistant',
      type: 'message',
      content: [
        {
          name: 'add_behavior',
          arguments:
            '{"behavior_name":"Platform","behavior_type":"PlatformBehavior::PlatformBehavior","scene_name":"Level1","object_name":"Ground"}',
          type: 'function_call',
          status: 'completed',
          call_id: 'tool_0_add_behavior',
        },
      ],
      status: 'completed',
    },
    {
      type: 'function_call_output',
      output:
        '{"success":true,"message":"Added behavior \\"Platform\\" of type \\"PlatformBehavior::PlatformBehavior\\" to object \\"Ground\\"."}',
      call_id: 'tool_0_add_behavior',
    },
    {
      role: 'assistant',
      type: 'message',
      content: [
        {
          annotations: [],
          text:
            'I have created the [TiledSpriteObject::TiledSprite](object_type:TiledSpriteObject::TiledSprite) object `Ground` and added the [PlatformBehavior::Platform](behavior_type:PlatformBehavior::Platform) to it. Now I will add instances of `Mario` and `Ground` to the scene.',
          type: 'output_text',
          status: 'completed',
        },
      ],
      status: 'completed',
    },
    {
      role: 'user',
      type: 'message',
      content: [
        {
          type: 'user_request',
          status: 'completed',
          text: 'Continue',
        },
      ],
      status: 'completed',
    },
    {
      role: 'assistant',
      type: 'message',
      content: [
        {
          name: 'put_2d_instance',
          arguments:
            '{"y":400,"scene_name":"Level1","x":0,"layer_name":"","object_name":"Ground"}',
          type: 'function_call',
          status: 'completed',
          call_id: 'tool_0_put_2d_instance',
        },
      ],
      status: 'completed',
    },
    {
      type: 'function_call_output',
      output:
        '{"success":true,"message":"Added instance of object \\"Ground\\" at position (0, 400) on layer \\"base\\""}',
      call_id: 'tool_0_put_2d_instance',
    },
    {
      role: 'assistant',
      type: 'message',
      content: [
        {
          name: 'put_2d_instance',
          arguments:
            '{"layer_name":"","scene_name":"Level1","y":300,"object_name":"Mario","x":100}',
          type: 'function_call',
          status: 'completed',
          call_id: 'tool_0_put_2d_instance',
        },
      ],
      status: 'completed',
    },
    {
      type: 'function_call_output',
      output:
        '{"success":true,"message":"Added instance of object \\"Mario\\" at position (100, 300) on layer \\"base\\""}',
      call_id: 'tool_0_put_2d_instance',
    },
    {
      role: 'assistant',
      type: 'message',
      content: [
        {
          annotations: [],
          text:
            'I have added instances of `Mario` and `Ground` to the scene. Now I will add events to allow `Mario` to move.',
          type: 'output_text',
          status: 'completed',
        },
      ],
      status: 'completed',
    },
    {
      role: 'assistant',
      type: 'message',
      content: [
        {
          name: 'add_scene_events',
          arguments:
            '{"extension_names_list":"Keyboard, PlatformBehavior::PlatformerObjectBehavior","scene_name":"Level1","objects_list":"Mario","events_description":"When the player presses the right arrow key, simulate pressing the right control for Mario. When the player presses the left arrow key, simulate pressing the left control for Mario. When the player presses the space bar, simulate pressing the jump control for Mario."}',
          type: 'function_call',
          status: 'completed',
          call_id: 'tool_0_add_scene_events',
        },
      ],
      status: 'completed',
    },
    {
      type: 'function_call_output',
      output: '{"success":true,"message":"Modified or added new event(s).\\""}',
      call_id: 'tool_0_add_scene_events',
    },
    {
      role: 'assistant',
      type: 'message',
      content: [
        {
          annotations: [],
          text:
            'I have added the basic movement controls for `Mario`. Now I will add more ground tiles.',
          type: 'output_text',
          status: 'completed',
        },
      ],
      status: 'completed',
    },
    {
      role: 'assistant',
      type: 'message',
      content: [
        {
          name: 'put_2d_instance',
          arguments:
            '{"y":400,"scene_name":"Level1","x":256,"layer_name":"","object_name":"Ground"}',
          type: 'function_call',
          status: 'completed',
          call_id: 'tool_0_put_2d_instance',
        },
      ],
      status: 'completed',
    },
    {
      type: 'function_call_output',
      output:
        '{"success":true,"message":"Added instance of object \\"Ground\\" at position (256, 400) on layer \\"base\\""}',
      call_id: 'tool_0_put_2d_instance',
    },
    {
      role: 'assistant',
      type: 'message',
      content: [
        {
          name: 'put_2d_instance',
          arguments:
            '{"y":400,"scene_name":"Level1","object_name":"Ground","x":512,"layer_name":""}',
          type: 'function_call',
          status: 'completed',
          call_id: 'tool_0_put_2d_instance',
        },
      ],
      status: 'completed',
    },
    {
      type: 'function_call_output',
      output:
        '{"success":true,"message":"Added instance of object \\"Ground\\" at position (512, 400) on layer \\"base\\""}',
      call_id: 'tool_0_put_2d_instance',
    },
    {
      role: 'assistant',
      type: 'message',
      content: [
        {
          name: 'put_2d_instance',
          arguments:
            '{"layer_name":"","object_name":"Ground","x":768,"y":400,"scene_name":"Level1"}',
          type: 'function_call',
          status: 'completed',
          call_id: 'tool_0_put_2d_instance',
        },
      ],
      status: 'completed',
    },
    {
      type: 'function_call_output',
      output:
        '{"success":true,"message":"Added instance of object \\"Ground\\" at position (768, 400) on layer \\"base\\""}',
      call_id: 'tool_0_put_2d_instance',
    },
    {
      role: 'assistant',
      type: 'message',
      content: [
        {
          name: 'put_2d_instance',
          arguments:
            '{"scene_name":"Level1","layer_name":"","y":400,"object_name":"Ground","x":1024}',
          type: 'function_call',
          status: 'completed',
          call_id: 'tool_0_put_2d_instance',
        },
      ],
      status: 'completed',
    },
    {
      type: 'function_call_output',
      output:
        '{"success":true,"message":"Added instance of object \\"Ground\\" at position (1024, 400) on layer \\"base\\""}',
      call_id: 'tool_0_put_2d_instance',
    },
    {
      role: 'assistant',
      type: 'message',
      content: [
        {
          name: 'put_2d_instance',
          arguments:
            '{"x":1280,"layer_name":"","object_name":"Ground","scene_name":"Level1","y":400}',
          type: 'function_call',
          status: 'completed',
          call_id: 'tool_0_put_2d_instance',
        },
      ],
      status: 'completed',
    },
    {
      type: 'function_call_output',
      output:
        '{"success":true,"message":"Added instance of object \\"Ground\\" at position (1280, 400) on layer \\"base\\""}',
      call_id: 'tool_0_put_2d_instance',
    },
    {
      role: 'assistant',
      type: 'message',
      content: [
        {
          annotations: [],
          text:
            'I have added more ground tiles. Now I will add a coin object for `Mario` to collect.',
          type: 'output_text',
          status: 'completed',
        },
      ],
      status: 'completed',
    },
    {
      role: 'assistant',
      type: 'message',
      content: [
        {
          name: 'create_object',
          arguments:
            '{"object_name":"Coin","object_type":"Sprite","scene_name":"Level1","description":"Coin for the player to collect"}',
          type: 'function_call',
          status: 'completed',
          call_id: 'tool_0_create_object',
        },
      ],
      status: 'completed',
    },
    {
      type: 'function_call_output',
      output:
        '{"success":true,"message":"Created object \\"Coin\\" of type \\"Sprite\\" in scene \\"Level1\\"."}',
      call_id: 'tool_0_create_object',
    },
    {
      role: 'assistant',
      type: 'message',
      content: [
        {
          name: 'put_2d_instance',
          arguments:
            '{"layer_name":"","y":200,"x":400,"object_name":"Coin","scene_name":"Level1"}',
          type: 'function_call',
          status: 'completed',
          call_id: 'tool_0_put_2d_instance',
        },
      ],
      status: 'completed',
    },
    {
      type: 'function_call_output',
      output:
        '{"success":true,"message":"Added instance of object \\"Coin\\" at position (400, 200) on layer \\"base\\""}',
      call_id: 'tool_0_put_2d_instance',
    },
    {
      role: 'assistant',
      type: 'message',
      content: [
        {
          annotations: [],
          text:
            'I have added a coin to the scene. Now I will add an event to allow `Mario` to collect the `Coin`.',
          type: 'output_text',
          status: 'completed',
        },
      ],
      status: 'completed',
    },
    {
      role: 'assistant',
      type: 'message',
      content: [
        {
          name: 'add_scene_events',
          arguments:
            '{"objects_list":"Mario, Coin","events_description":"When Mario collides with Coin, delete Coin and add 100 to the scene variable Score","extension_names_list":"Sprite, Variables","scene_name":"Level1"}',
          type: 'function_call',
          status: 'completed',
          call_id: 'tool_0_add_scene_events',
        },
      ],
      status: 'completed',
    },
    {
      type: 'function_call_output',
      output: '{"success":true,"message":"Modified or added new event(s).\\""}',
      call_id: 'tool_0_add_scene_events',
    },
    {
      role: 'assistant',
      type: 'message',
      content: [
        {
          annotations: [],
          text:
            "I have added the event for `Mario` collecting the `Coin`. Now I will add a text object to display the player's score.",
          type: 'output_text',
          status: 'completed',
        },
      ],
      status: 'completed',
    },
    {
      role: 'assistant',
      type: 'message',
      content: [
        {
          name: 'create_object',
          arguments:
            '{"object_name":"ScoreText","object_type":"TextObject::Text","scene_name":"Level1","description":"Text object to display the score"}',
          type: 'function_call',
          status: 'completed',
          call_id: 'tool_0_create_object',
        },
      ],
      status: 'completed',
    },
    {
      type: 'function_call_output',
      output:
        '{"success":true,"message":"Created object \\"ScoreText\\" of type \\"TextObject::Text\\" in scene \\"Level1\\"."}',
      call_id: 'tool_0_create_object',
    },
    {
      role: 'assistant',
      type: 'message',
      content: [
        {
          name: 'put_2d_instance',
          arguments:
            '{"layer_name":"","object_name":"ScoreText","x":100,"y":50,"scene_name":"Level1"}',
          type: 'function_call',
          status: 'completed',
          call_id: 'tool_0_put_2d_instance',
        },
      ],
      status: 'completed',
    },
    {
      type: 'function_call_output',
      output:
        '{"success":true,"message":"Added instance of object \\"ScoreText\\" at position (100, 50) on layer \\"base\\""}',
      call_id: 'tool_0_put_2d_instance',
    },
    {
      role: 'assistant',
      type: 'message',
      content: [
        {
          name: 'add_scene_events',
          arguments:
            '{"objects_list":"Mario, Coin, ScoreText","extension_names_list":"Sprite, Variables, TextObject","scene_name":"Level1","events_description":"At the beginning of the scene, set the text of ScoreText to \\"Score: \\" + ToString(Variable(Score)). When Mario collides with Coin, delete Coin, add 100 to the scene variable Score, and set the text of ScoreText to \\"Score: \\" + ToString(Variable(Score))"}',
          type: 'function_call',
          status: 'completed',
          call_id: 'tool_0_add_scene_events',
        },
      ],
      status: 'completed',
    },
    {
      type: 'function_call_output',
      output: '{"success":true,"message":"Modified or added new event(s).\\""}',
      call_id: 'tool_0_add_scene_events',
    },
    {
      role: 'assistant',
      type: 'message',
      content: [
        {
          annotations: [],
          text:
            'I have added the score display. Now I will add a simple enemy object that moves back and forth.',
          type: 'output_text',
          status: 'completed',
        },
      ],
      status: 'completed',
    },
    {
      role: 'assistant',
      type: 'message',
      content: [
        {
          name: 'create_object',
          arguments:
            '{"object_name":"Enemy","description":"Enemy that moves back and forth","scene_name":"Level1","object_type":"Sprite"}',
          type: 'function_call',
          status: 'completed',
          call_id: 'tool_0_create_object',
        },
      ],
      status: 'completed',
    },
    {
      type: 'function_call_output',
      output:
        '{"success":true,"message":"Created object \\"Enemy\\" of type \\"Sprite\\" in scene \\"Level1\\"."}',
      call_id: 'tool_0_create_object',
    },
    {
      role: 'assistant',
      type: 'message',
      content: [
        {
          name: 'add_behavior',
          arguments:
            '{"behavior_type":"TimedBackAndForthMovement::TimedBackAndForthMirroredMovement","behavior_name":"TimedBackAndForthMovement","scene_name":"Level1","object_name":"Enemy"}',
          type: 'function_call',
          status: 'completed',
          call_id: 'tool_0_add_behavior',
        },
      ],
      status: 'completed',
    },
    {
      type: 'function_call_output',
      output:
        '{"success":true,"message":"Added behavior \\"TimedBackAndForthMovement\\" of type \\"TimedBackAndForthMovement::TimedBackAndForthMirroredMovement\\" to object \\"Enemy\\"."}',
      call_id: 'tool_0_add_behavior',
    },
    {
      role: 'assistant',
      type: 'message',
      content: [
        {
          name: 'put_2d_instance',
          arguments:
            '{"layer_name":"","scene_name":"Level1","object_name":"Enemy","x":600,"y":300}',
          type: 'function_call',
          status: 'completed',
          call_id: 'tool_0_put_2d_instance',
        },
      ],
      status: 'completed',
    },
    {
      type: 'function_call_output',
      output:
        '{"success":true,"message":"Added instance of object \\"Enemy\\" at position (600, 300) on layer \\"base\\""}',
      call_id: 'tool_0_put_2d_instance',
    },
    {
      role: 'assistant',
      type: 'message',
      content: [
        {
          annotations: [],
          text:
            'I have added an enemy to the scene. Now I will add an event to handle collisions between `Mario` and the `Enemy`.',
          type: 'output_text',
          status: 'completed',
        },
      ],
      status: 'completed',
    },
    {
      role: 'assistant',
      type: 'message',
      content: [
        {
          name: 'add_scene_events',
          arguments:
            '{"objects_list":"Mario, Enemy","scene_name":"Level1","extension_names_list":"Sprite, Scene","events_description":"When Mario collides with Enemy, change the scene to Level1"}',
          type: 'function_call',
          status: 'completed',
          call_id: 'tool_0_add_scene_events',
        },
      ],
      status: 'completed',
    },
    {
      type: 'function_call_output',
      output: '{"success":true,"message":"Modified or added new event(s).\\""}',
      call_id: 'tool_0_add_scene_events',
    },
    {
      role: 'assistant',
      type: 'message',
      content: [
        {
          annotations: [],
          text:
            "I have added a basic enemy that restarts the scene when it collides with `Mario`. This fulfills the user's request at a basic level.",
          type: 'output_text',
          status: 'completed',
        },
      ],
      status: 'completed',
    },
  ],
  mode: 'agent',
  toolsVersion: 'v1',
  stats: {
    lastRunUserPromptTemplateHash:
      'fae133eea28c2c1348a84c12ba256a6fb1ea4a109be30fc47b47de2cd123d3ca',
    lastOutputRetriesCount: 0,
    remainingMissingPrefixedTypes: [],
    lastRunSystemPromptHash:
      'f17d837afbc438714419cc3fd616ae45e8433c4bd6e3a340f695573993221d6c',
    finalModelPublicId: 'g2f1-g',
  },
};
