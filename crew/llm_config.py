"""
LLM Configuration Manager
Handles loading and creating LLM instances from configuration
"""
import json
import os
from typing import Dict, Optional
from langchain_openai import ChatOpenAI
from dotenv import load_dotenv

load_dotenv()

class LLMConfigManager:
    """Manages LLM provider configurations and creates LLM instances"""
    
    def __init__(self):
        self.providers_config_path = os.path.join(
            os.path.dirname(__file__), '..', 'config', 'llm-providers.json'
        )
        self.workflow_models_config_path = os.path.join(
            os.path.dirname(__file__), '..', 'config', 'workflow-models.json'
        )
        # Don't cache configs - reload on each access for hot-reload support
        self._providers_cache = None
        self._workflow_models_cache = None
        self._cache_timestamp = 0

    @property
    def providers(self) -> Dict:
        """Get providers with hot-reload support"""
        return self._load_providers()

    @property
    def workflow_models(self) -> Dict:
        """Get workflow models with hot-reload support"""
        return self._load_workflow_models()
    
    def _load_providers(self) -> Dict:
        """Load LLM providers configuration"""
        if not os.path.exists(self.providers_config_path):
            # Return default provider (Tu-Zi)
            return {
                'tuzi': {
                    'id': 'tuzi',
                    'name': 'Tu-Zi (Claude Sonnet 4.5)',
                    'type': 'custom',
                    'baseURL': os.getenv('OPENAI_API_BASE', 'https://api.tu-zi.com/v1'),
                    'apiKey': os.getenv('OPENAI_API_KEY', ''),
                    'models': [os.getenv('OPENAI_MODEL_NAME', 'claude-sonnet-4.5')],
                    'defaultModel': os.getenv('OPENAI_MODEL_NAME', 'claude-sonnet-4.5'),
                    'enabled': True,
                }
            }

        try:
            with open(self.providers_config_path, 'r', encoding='utf-8') as f:
                providers_list = json.load(f)
                # Convert list to dict for easier lookup
                providers = {}
                for p in providers_list:
                    if p.get('enabled', True):
                        provider_id = p['id']

                        # Override API key from environment variable if available
                        # Priority: {PROVIDER_ID}_API_KEY > OPENAI_API_KEY (for tuzi)
                        env_key = f"{provider_id.upper()}_API_KEY"
                        if os.getenv(env_key):
                            p['apiKey'] = os.getenv(env_key)
                        elif provider_id == 'tuzi' and os.getenv('OPENAI_API_KEY'):
                            # Backward compatibility for tuzi
                            p['apiKey'] = os.getenv('OPENAI_API_KEY')

                        # Override baseURL from environment variable if available
                        # This allows flexibility to change endpoints without modifying JSON
                        env_base_url = f"{provider_id.upper()}_API_BASE"
                        if os.getenv(env_base_url):
                            p['baseURL'] = os.getenv(env_base_url)
                        elif provider_id == 'tuzi' and os.getenv('OPENAI_API_BASE'):
                            # Backward compatibility for tuzi
                            p['baseURL'] = os.getenv('OPENAI_API_BASE')

                        providers[provider_id] = p
                return providers
        except Exception as e:
            print(f"Error loading LLM providers: {e}")
            return {}
    
    def _load_workflow_models(self) -> Dict:
        """Load workflow model configurations"""
        if not os.path.exists(self.workflow_models_config_path):
            return {}
        
        try:
            with open(self.workflow_models_config_path, 'r', encoding='utf-8') as f:
                configs_list = json.load(f)
                # Convert list to dict for easier lookup
                return {c['workflowId']: c for c in configs_list}
        except Exception as e:
            print(f"Error loading workflow models: {e}")
            return {}
    
    def get_llm_for_agent(
        self, 
        workflow_id: str, 
        agent_name: str,
        temperature: float = 0.7,
        max_tokens: int = 4000
    ) -> ChatOpenAI:
        """
        Get LLM instance for a specific agent in a workflow
        
        Args:
            workflow_id: ID of the workflow
            agent_name: Name of the agent
            temperature: LLM temperature
            max_tokens: Maximum tokens
            
        Returns:
            ChatOpenAI instance configured for the agent
        """
        # Get workflow model config
        workflow_config = self.workflow_models.get(workflow_id)
        
        # Determine which provider and model to use
        provider_id = None
        model = None
        
        if workflow_config:
            # Check if there's a specific config for this agent
            agent_configs = workflow_config.get('agentConfigs', [])
            for agent_config in agent_configs:
                if agent_config['agentName'] == agent_name:
                    provider_id = agent_config['providerId']
                    model = agent_config['model']
                    break
            
            # If no agent-specific config, use workflow default
            if not provider_id:
                provider_id = workflow_config.get('defaultProviderId')
                model = workflow_config.get('defaultModel')
        
        # If still no provider, use the first enabled provider
        if not provider_id and self.providers:
            provider_id = list(self.providers.keys())[0]
        
        # Get provider config
        if provider_id and provider_id in self.providers:
            provider = self.providers[provider_id]
        else:
            # Fallback to environment variables
            provider = {
                'baseURL': os.getenv('OPENAI_API_BASE', 'https://api.tu-zi.com/v1'),
                'apiKey': os.getenv('OPENAI_API_KEY', ''),
                'defaultModel': os.getenv('OPENAI_MODEL_NAME', 'claude-sonnet-4.5'),
            }
        
        # Use provider's default model if not specified
        if not model:
            model = provider.get('defaultModel', 'gpt-4')
        
        # Create and return LLM instance
        # Note: LangChain/OpenAI SDK reads OPENAI_API_BASE and OPENAI_API_KEY
        # from environment variables, which may override our parameters.
        # We need to temporarily clear these env vars when creating the client.

        # Save original env vars
        original_base = os.environ.get('OPENAI_API_BASE')
        original_key = os.environ.get('OPENAI_API_KEY')
        original_base_url = os.environ.get('OPENAI_BASE_URL')

        try:
            # Temporarily set env vars to our provider's values
            os.environ['OPENAI_API_BASE'] = provider['baseURL']
            os.environ['OPENAI_BASE_URL'] = provider['baseURL']
            os.environ['OPENAI_API_KEY'] = provider['apiKey']

            llm = ChatOpenAI(
                model=model,
                temperature=temperature,
                max_tokens=max_tokens,
                base_url=provider['baseURL'],
                api_key=provider['apiKey'],
                streaming=True,
            )

            return llm
        finally:
            # Restore original env vars
            if original_base is not None:
                os.environ['OPENAI_API_BASE'] = original_base
            elif 'OPENAI_API_BASE' in os.environ:
                del os.environ['OPENAI_API_BASE']

            if original_base_url is not None:
                os.environ['OPENAI_BASE_URL'] = original_base_url
            elif 'OPENAI_BASE_URL' in os.environ:
                del os.environ['OPENAI_BASE_URL']

            if original_key is not None:
                os.environ['OPENAI_API_KEY'] = original_key
            elif 'OPENAI_API_KEY' in os.environ:
                del os.environ['OPENAI_API_KEY']
    
    def get_default_llm(
        self,
        temperature: float = 0.7,
        max_tokens: int = 4000
    ) -> ChatOpenAI:
        """
        Get default LLM instance
        
        Args:
            temperature: LLM temperature
            max_tokens: Maximum tokens
            
        Returns:
            ChatOpenAI instance with default configuration
        """
        # Use first enabled provider
        if self.providers:
            provider_id = list(self.providers.keys())[0]
            provider = self.providers[provider_id]
            model = provider.get('defaultModel', 'gpt-4')
        else:
            # Fallback to environment variables
            provider = {
                'baseURL': os.getenv('OPENAI_API_BASE', 'https://api.tu-zi.com/v1'),
                'apiKey': os.getenv('OPENAI_API_KEY', ''),
            }
            model = os.getenv('OPENAI_MODEL_NAME', 'claude-sonnet-4.5')
        
        # Temporarily set env vars to prevent override
        original_base = os.environ.get('OPENAI_API_BASE')
        original_key = os.environ.get('OPENAI_API_KEY')
        original_base_url = os.environ.get('OPENAI_BASE_URL')

        try:
            os.environ['OPENAI_API_BASE'] = provider['baseURL']
            os.environ['OPENAI_BASE_URL'] = provider['baseURL']
            os.environ['OPENAI_API_KEY'] = provider['apiKey']

            llm = ChatOpenAI(
                model=model,
                temperature=temperature,
                max_tokens=max_tokens,
                base_url=provider['baseURL'],
                api_key=provider['apiKey'],
                streaming=True,
            )

            return llm
        finally:
            if original_base is not None:
                os.environ['OPENAI_API_BASE'] = original_base
            elif 'OPENAI_API_BASE' in os.environ:
                del os.environ['OPENAI_API_BASE']

            if original_base_url is not None:
                os.environ['OPENAI_BASE_URL'] = original_base_url
            elif 'OPENAI_BASE_URL' in os.environ:
                del os.environ['OPENAI_BASE_URL']

            if original_key is not None:
                os.environ['OPENAI_API_KEY'] = original_key
            elif 'OPENAI_API_KEY' in os.environ:
                del os.environ['OPENAI_API_KEY']

# Global instance
llm_config_manager = LLMConfigManager()

