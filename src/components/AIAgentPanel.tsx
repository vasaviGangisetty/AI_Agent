
import React, { useState } from 'react';
import { Send, X, Bot, LoaderCircle } from 'lucide-react';

import type {
  TripPlan,
  ItineraryDay,
  Expense,
} from '../types/travel';

type JsonObject = Record<string, unknown>;

type AgentAction =
  | {
      type: 'update_trip';
      changes: Partial<TripPlan>;
      reason?: string;
      requiresRegeneration?: boolean;
    }
  | {
      type: 'regenerate_itinerary';
      reason?: string;
    }
  | {
      type: 'add_activity';
      dayNumber: number;
      activity: JsonObject;
    }
  | {
      type: 'remove_activity';
      dayNumber: number;
      activityId?: string;
      activityTitle?: string;
    }
  | {
      type: 'update_activity';
      dayNumber: number;
      activityId?: string;
      activityTitle?: string;
      activity: JsonObject;
    }
  | {
      type: 'add_expense';
      expense: JsonObject;
    }
  | {
      type: 'remove_expense';
      expenseId: string;
    }
  | {
      type: 'none';
    };

interface AIAgentPanelProps {
  plan: TripPlan;
  itinerary: ItineraryDay[];
  expenses: Expense[];
  isOpen: boolean;
  onClose: () => void;
  onApplyOptimization: () => void;
  onSwapRainAlternative: () => void;
  onViewBudget: () => void;
  onRegenerateItinerary: (
    newPlan: TripPlan,
    reason?: string
  ) => void;

  // Connect these callbacks to your main page's React state.
  onUpdatePlan?: (changes: Partial<TripPlan>) => void;

  onAddActivity?: (
    dayNumber: number,
    activity: JsonObject
  ) => boolean;

  onRemoveActivity?: (
    dayNumber: number,
    activityId?: string,
    activityTitle?: string
  ) => boolean;

  onUpdateActivity?: (
    dayNumber: number,
    activityId: string | undefined,
    activityTitle: string | undefined,
    changes: JsonObject
  ) => boolean;

  onAddExpense?: (expense: JsonObject) => boolean;

  onRemoveExpense?: (expenseId: string) => boolean;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'agent';
  text: string;
}

interface ChatApiResponse {
  success?: boolean;
  reply?: string;
  actions?: AgentAction[];
  error?: string;
}

function makeMessage(
  role: ChatMessage['role'],
  text: string
): ChatMessage {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    role,
    text,
  };
}

function isObject(value: unknown): value is JsonObject {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value)
  );
}

export default function AIAgentPanel({
  plan,
  itinerary,
  expenses,
  isOpen,
  onClose,
  onApplyOptimization,
  onSwapRainAlternative,
  onViewBudget,
  onRegenerateItinerary,
  onUpdatePlan,
  onAddActivity,
  onRemoveActivity,
  onUpdateActivity,
  onAddExpense,
  onRemoveExpense,
}: AIAgentPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    makeMessage(
      'agent',
      'Hello! I can help update your trip plan, activities, itinerary, and expenses. Tell me what you would like to change.'
    ),
  ]);

  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  function executeActions(actions: AgentAction[]): string[] {
    const results: string[] = [];
    const allTripChanges = actions.reduce<Partial<TripPlan>>(
      (changes, action) =>
        action.type === 'update_trip'
          ? { ...changes, ...action.changes }
          : changes,
      {}
    );
    const effectivePlan = { ...plan, ...allTripChanges };
    const regenerationAction = actions.find(
      (action) => action.type === 'regenerate_itinerary'
    );
    const planUpdateAction = actions.find(
      (action) => action.type === 'update_trip'
    );
    const needsRegeneration =
      Boolean(regenerationAction) ||
      actions.some(
        (action) =>
          action.type === 'update_trip' && action.requiresRegeneration
      ) ||
      effectivePlan.destination !== plan.destination ||
      effectivePlan.durationDays !== plan.durationDays;
    let regenerationHandled = false;

    for (const action of actions) {
      switch (action.type) {
        case 'update_trip': {
          if (!isObject(action.changes)) {
            results.push('The trip update was invalid.');
            break;
          }

          if (!onUpdatePlan) {
            results.push(
              'Trip changes were returned, but the main page does not provide onUpdatePlan.'
            );
            break;
          }

          onUpdatePlan(action.changes);

          results.push('Trip details updated.');

          break;
        }

        case 'regenerate_itinerary': {
          if (!regenerationHandled) {
            onRegenerateItinerary(
              effectivePlan,
              action.reason ?? 'Regenerate the itinerary'
            );
            regenerationHandled = true;
            results.push('Requested itinerary regeneration.');
          }

          break;
        }

        case 'add_activity': {
          if (!onAddActivity) {
            results.push(
              'Adding activities is not connected to the main page.'
            );
            break;
          }

          if (
            !Number.isInteger(action.dayNumber) ||
            action.dayNumber < 1 ||
            !isObject(action.activity)
          ) {
            results.push('The activity data was invalid.');
            break;
          }

          results.push(
            onAddActivity(action.dayNumber, action.activity)
              ? `Added activity to day ${action.dayNumber}.`
              : `Could not add an activity to day ${action.dayNumber}.`
          );
          break;
        }

        case 'remove_activity': {
          if (!onRemoveActivity) {
            results.push(
              'Removing activities is not connected to the main page.'
            );
            break;
          }

          results.push(
            onRemoveActivity(
              action.dayNumber,
              action.activityId,
              action.activityTitle
            )
              ? `Removed activity from day ${action.dayNumber}.`
              : `Could not find that activity on day ${action.dayNumber}.`
          );
          break;
        }

        case 'update_activity': {
          if (!onUpdateActivity) {
            results.push(
              'Updating activities is not connected to the main page.'
            );
            break;
          }

          if (!isObject(action.activity)) {
            results.push('The activity update was invalid.');
            break;
          }

          results.push(
            onUpdateActivity(
              action.dayNumber,
              action.activityId,
              action.activityTitle,
              action.activity
            )
              ? `Updated activity on day ${action.dayNumber}.`
              : `Could not find that activity on day ${action.dayNumber}.`
          );
          break;
        }

        case 'add_expense': {
          if (!onAddExpense) {
            results.push(
              'Adding expenses is not connected to the main page.'
            );
            break;
          }

          if (!isObject(action.expense)) {
            results.push('The expense data was invalid.');
            break;
          }

          results.push(
            onAddExpense(action.expense)
              ? 'Added the expense.'
              : 'Could not add the expense.'
          );
          break;
        }

        case 'remove_expense': {
          if (!onRemoveExpense) {
            results.push(
              'Removing expenses is not connected to the main page.'
            );
            break;
          }

          results.push(
            onRemoveExpense(action.expenseId)
              ? 'Removed the expense.'
              : 'Could not find that expense.'
          );
          break;
        }

        case 'none': {
          // This action does not change the application state.
          break;
        }

        default: {
          results.push('An unsupported action was returned.');
          break;
        }
      }
    }

    if (needsRegeneration && !regenerationHandled) {
      onRegenerateItinerary(
        effectivePlan,
        planUpdateAction?.type === 'update_trip'
          ? planUpdateAction.reason ?? 'Updated trip details'
          : 'Updated trip details'
      );
      results.push('Requested itinerary regeneration.');
    }

    return results;
  }

  async function handleSendMessage(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const userText = input.trim();

    if (!userText || isThinking) {
      return;
    }

    setMessages((previous) => [
      ...previous,
      makeMessage('user', userText),
    ]);

    setInput('');
    setIsThinking(true);
    setErrorMessage('');

    try {
      const response = await fetch('/api/advisor/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: userText,
          history: messages
            .slice(-10)
            .map(({ role, text }) => ({ role, text })),
          plan,
          itinerary,
          expenses,
        }),
      });

      const data: ChatApiResponse = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || `Server error: ${response.status}`
        );
      }

      if (data.success === false) {
        throw new Error(data.error || 'The AI request failed.');
      }

      const actionResults = executeActions(
        Array.isArray(data.actions) ? data.actions : []
      );

      const reply =
        typeof data.reply === 'string' && data.reply.trim()
          ? data.reply
          : 'I processed your request.';

      const fullReply =
        actionResults.length > 0
          ? `${reply}\n\nAction results:\n${actionResults
              .map((result) => `- ${result}`)
              .join('\n')}`
          : reply;

      setMessages((previous) => [
        ...previous,
        makeMessage('agent', fullReply),
      ]);
    } catch (error: unknown) {
      console.error('AI Travel Agent request failed:', error);

      const errorText =
        error instanceof Error
          ? error.message
          : 'An unknown error occurred.';

      setErrorMessage(
        `The AI request failed: ${errorText}`
      );

      setMessages((previous) => [
        ...previous,
        makeMessage(
          'agent',
          'I could not contact the AI advisor, so I did not apply any changes. Please check that the app server is running and that its Gemini API key is configured, then try again.'
        ),
      ]);
    } finally {
      setIsThinking(false);
    }
  }

  if (!isOpen) {
    return null;
  }

  return (
    <section className="ai-agent-panel">
      <header className="ai-agent-header">
        <div className="ai-agent-heading">
          <Bot size={22} />
          <div>
            <h2>AI Travel Agent</h2>
            <p>Plan and manage your trip</p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="Close AI Travel Agent"
        >
          <X size={20} />
        </button>
      </header>

      <div className="ai-agent-quick-actions">
        <button type="button" onClick={onApplyOptimization}>
          Optimize trip
        </button>

        <button type="button" onClick={onSwapRainAlternative}>
          Rain alternative
        </button>

        <button type="button" onClick={onViewBudget}>
          View budget
        </button>
      </div>

      <div
        className="ai-agent-messages"
        aria-live="polite"
        aria-label="Chat messages"
      >
        {messages.map((message) => (
          <div
            key={message.id}
            className={`ai-message ai-message-${message.role}`}
          >
            <div className="ai-message-label">
              {message.role === 'user' ? 'You' : 'Travel Agent'}
            </div>

            <div className="ai-message-text">
              {message.text}
            </div>
          </div>
        ))}

        {isThinking && (
          <div className="ai-message ai-message-agent">
            <LoaderCircle size={16} />
            <span>Thinking...</span>
          </div>
        )}
      </div>

      {errorMessage && (
        <p className="ai-agent-error" role="alert">
          {errorMessage}
        </p>
      )}

      <form
        className="ai-agent-input-form"
        onSubmit={handleSendMessage}
      >
        <input
          type="text"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Example: Set my budget to ₹15,000"
          disabled={isThinking}
          aria-label="Message the AI Travel Agent"
        />

        <button
          type="submit"
          disabled={isThinking || !input.trim()}
          aria-label="Send message"
        >
          <Send size={18} />
        </button>
      </form>
    </section>
  );
}
