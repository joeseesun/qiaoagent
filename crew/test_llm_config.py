"""
Test LLM Configuration Manager
"""
from crew.llm_config import llm_config_manager

def test_llm_config():
    print("🧪 Testing LLM Configuration Manager\n")
    
    # Test 1: Load providers
    print("📋 Test 1: Load providers")
    print(f"   Loaded {len(llm_config_manager.providers)} providers:")
    for provider_id, provider in llm_config_manager.providers.items():
        print(f"   - {provider['name']} ({provider_id})")
        print(f"     Base URL: {provider['baseURL']}")
        print(f"     Models: {', '.join(provider['models'])}")
        print(f"     Default: {provider['defaultModel']}")
    print()
    
    # Test 2: Get default LLM
    print("🤖 Test 2: Get default LLM")
    try:
        llm = llm_config_manager.get_default_llm()
        print(f"   ✅ Default LLM created successfully")
        print(f"   Model: {llm.model_name}")
        print(f"   Base URL: {llm.openai_api_base}")
    except Exception as e:
        print(f"   ❌ Error: {e}")
    print()
    
    # Test 3: Get LLM for specific agent
    print("🎯 Test 3: Get LLM for specific agent")
    try:
        llm = llm_config_manager.get_llm_for_agent(
            workflow_id='wechat_title_creator',
            agent_name='ContentAnalyzer'
        )
        print(f"   ✅ Agent LLM created successfully")
        print(f"   Model: {llm.model_name}")
        print(f"   Base URL: {llm.openai_api_base}")
    except Exception as e:
        print(f"   ❌ Error: {e}")
    print()
    
    # Test 4: Load workflow models
    print("📊 Test 4: Load workflow models")
    print(f"   Loaded {len(llm_config_manager.workflow_models)} workflow configs:")
    for workflow_id, config in llm_config_manager.workflow_models.items():
        print(f"   - {workflow_id}")
        print(f"     Default Provider: {config.get('defaultProviderId')}")
        print(f"     Default Model: {config.get('defaultModel')}")
        print(f"     Agent Configs: {len(config.get('agentConfigs', []))}")
    print()
    
    print("✅ All tests completed!")

if __name__ == '__main__':
    test_llm_config()

